from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from logic.combined_predictor.predict import combine_predictions
from auth.routes import router as auth_router


app = FastAPI()


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





