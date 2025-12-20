from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from logic.combined_predictor.predict import combine_predictions




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
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






# # 1️⃣ Get all teams
# @app.get("/teams")
# def get_teams():
#     return {"teams": teams_data}

# 2️⃣ Get logo for a team
# @app.get("/logo/{team_name}")
# def get_logo(team_name: str):
#     return {"team": team_name, "logo": logos_data.get(team_name, None)}



# @app.get("/players/{team_name}")
# def get_players(team_name: str):
#     players = players_data.get(team_name, [])
#     return {"team": team_name, "players": players}


# with open(metrics_file) as f:
#     metrics_data = json.load(f)

# @app.get("/club-metrics/{team_name}")
# def get_metrics(team_name: str):
#     return {
#         "team": team_name,
#         "metrics": metrics_data.get(team_name, [])
#     }
    
    
# Load JSON at startup
# with open(history_file) as f:
#     history_data = json.load(f)
    
# @app.get("/club-history/{team_name}")
# def get_club_history(team_name: str):

#     team_name_lower = team_name.lower()

#     if team_name_lower in history_data:
#         return {"history": history_data[team_name_lower]}
#     return {"history": []}




# 4️⃣ Get player rating (optional)
# @app.get("/rating/{player_name}")
# def get_rating(player_name: str):
#     # later fetch dynamic ratings from real APIs
#     return {"player": player_name, "rating": 80}  # static for now



# with open(teamdata_file) as f:
#     teamdata = json.load(f)


# @app.get("/team-info/{team_name}")
# def get_team_info(team_name: str):
#     team_name_lower = team_name.lower()

#     if team_name_lower in teamdata:
#         return teamdata[team_name_lower]
#     return {}




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

@app.get("/teams")
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    return {"teams": [t.name for t in teams]}


@app.get("/logo/{team_name}")
def get_logo(team_name: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.name == team_name).first()
    return {"team": team_name, "logo": team.logo if team else None}

from database.models import Player

@app.get("/players/{team_name}")
def get_players(team_name: str, db: Session = Depends(get_db)):
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
def get_metrics(team_name: str, db: Session = Depends(get_db)):
    row = db.query(ClubMetric).filter(ClubMetric.team == team_name).first()
    return {"team": team_name, "metrics": row.metrics if row else []}


from database.models import ClubHistory

@app.get("/club-history/{team_name}")
def get_club_history(team_name: str, db: Session = Depends(get_db)):
    row = db.query(ClubHistory).filter(
        ClubHistory.team == team_name.lower()
    ).first()
    return {"history": row.history if row else []}





