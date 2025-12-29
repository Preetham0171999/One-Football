from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional

from logic.combined_predictor.predict import combine_predictions
from auth.routes import router as auth_router


app = FastAPI()


@app.on_event("startup")
def _ensure_db_schema():
    """Lightweight schema guard for local development (no migrations).

    1) Creates missing tables.
    2) Adds any newer columns used by the app.
    """
    try:
        from sqlalchemy import text
        from database.db import engine
        from database.models import Base

        # Create any missing tables first (prevents UndefinedTable errors).
        Base.metadata.create_all(bind=engine)

        # Postgres supports IF NOT EXISTS
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS name VARCHAR"))
            conn.commit()
    except Exception:
        # If the DB isn't reachable at startup, normal routes will fail anyway.
        # Don't crash the app here; surface errors on request.
        pass


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",     # 👈 THIS is the missing one
        "http://127.0.0.1:5173",     # 👈 optional but good
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Using the database for all data. JSON-based loading removed.
class Match(BaseModel):
    team_a: str
    team_b: str
    left_formation: str      # 👈 added
    right_formation: str     # 👈 added
    left_playing_11: dict
    right_playing_11: dict
    left_rating: float
    right_rating: float





@app.post("/predict")
def predict(match: Match):
    try:
        result = combine_predictions(
            match.team_a,
            match.team_b,
            match.left_formation,      # 👈 pass through
            match.right_formation,     # 👈 pass through
            match.left_playing_11,
            match.right_playing_11,
            match.left_rating,
            match.right_rating
        )
    except Exception as e:
        return {"error": str(e)}

    return {"winner": result}








app.include_router(auth_router)

from database.db import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
        
from database.models import Team
from auth.security import get_current_user


@app.get("/teams")
def get_teams(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    teams = db.query(Team).all()
    return {"teams": [t.name for t in teams]}


@app.get("/logo/{team_name}")
def get_logo(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    team = db.query(Team).filter(Team.name == team_name).first()
    return {"team": team_name, "logo": team.logo if team else None}

from database.models import Player

@app.get("/players/{team_name}")
def get_players(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    players = db.query(Player).filter(Player.team == team_name).all()
    return {
        "team": team_name,
        "players": [
            {
                "name": p.name,
                "position": p.position,
                "rating": p.rating
            } for p in players
        ]
    }



from database.models import ClubMetric

@app.get("/club-metrics/{team_name}")
def get_metrics(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    row = db.query(ClubMetric).filter(ClubMetric.team == team_name).first()
    return {"team": team_name, "metrics": row.metrics if row else []}


from database.models import ClubHistory

@app.get("/club-history/{team_name}")
def get_club_history(team_name: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    row = db.query(ClubHistory).filter(
        ClubHistory.team == team_name.lower()
    ).first()
    return {"history": row.history if row else []}


# ----------------------------
# Saved analyses (per-user)
# ----------------------------
from database.models import Analysis


class AnalysisCreate(BaseModel):
    name: str
    team: Optional[str] = None
    formation: Optional[str] = None
    assigned: dict[str, Any]
    subs: dict[str, Any]
    freePositions: dict[str, Any]
    arrows: list[dict[str, Any]]


@app.post("/analysis")
def save_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    name = (payload.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Analysis name is required")

    analysis = (
        db.query(Analysis)
        .filter(Analysis.user_email == current_user, Analysis.name == name)
        .first()
    )

    if analysis:
        analysis.team = payload.team
        analysis.formation = payload.formation
        analysis.assigned = payload.assigned
        analysis.subs = payload.subs
        analysis.free_positions = payload.freePositions
        analysis.arrows = payload.arrows
    else:
        analysis = Analysis(
            user_email=current_user,
            name=name,
            team=payload.team,
            formation=payload.formation,
            assigned=payload.assigned,
            subs=payload.subs,
            free_positions=payload.freePositions,
            arrows=payload.arrows,
        )
        db.add(analysis)
    try:
        db.commit()
        db.refresh(analysis)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "id": analysis.id,
        "name": analysis.name,
        "created_at": analysis.created_at,
        "team": analysis.team,
        "formation": analysis.formation,
    }


@app.get("/analysis")
def list_analyses(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    rows = (
        db.query(Analysis)
        .filter(Analysis.user_email == current_user)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return {
        "analyses": [
            {
                "id": a.id,
                "name": a.name,
                "created_at": a.created_at,
                "team": a.team,
                "formation": a.formation,
            }
            for a in rows
        ]
    }


@app.get("/analysis/{analysis_id}")
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    a = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_email == current_user)
        .first()
    )
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": a.id,
        "name": a.name,
        "created_at": a.created_at,
        "team": a.team,
        "formation": a.formation,
        "assigned": a.assigned,
        "subs": a.subs,
        "freePositions": a.free_positions,
        "arrows": a.arrows,
    }





