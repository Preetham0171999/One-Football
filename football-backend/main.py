from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
metrics_file = os.path.join(BASE_DIR, "data", "clubMetrics.json")
history_file = os.path.join(BASE_DIR, "data", "history.json")




def load_json(filename):
    with open(os.path.join(BASE_DIR, "data", filename), "r") as f:
        return json.load(f)
    
def load_json_lowercase(path):
    with open(path) as f:
        data = json.load(f)
        return {k.lower(): v for k, v in data.items()}


teams_data = load_json("teams.json")
players_data = load_json("players.json")
logos_data = load_json("logos.json")
ratings_data = load_json("playerRatings.json") 
metrics_data = load_json("clubMetrics.json")
teamdata_file = "data/teamdata.json"




# 1️⃣ Get all teams
@app.get("/teams")
def get_teams():
    return {"teams": teams_data}

# 2️⃣ Get logo for a team
@app.get("/logo/{team_name}")
def get_logo(team_name: str):
    return {"team": team_name, "logo": logos_data.get(team_name, None)}



@app.get("/players/{team_name}")
def get_players(team_name: str):
    players = players_data.get(team_name, [])
    return {"team": team_name, "players": players}


with open(metrics_file) as f:
    metrics_data = json.load(f)

@app.get("/club-metrics/{team_name}")
def get_metrics(team_name: str):
    return {
        "team": team_name,
        "metrics": metrics_data.get(team_name, [])
    }
    
    
# Load JSON at startup
with open(history_file) as f:
    history_data = json.load(f)
    
@app.get("/club-history/{team_name}")
def get_club_history(team_name: str):

    team_name_lower = team_name.lower()

    if team_name_lower in history_data:
        return {"history": history_data[team_name_lower]}
    return {"history": []}




# 4️⃣ Get player rating (optional)
@app.get("/rating/{player_name}")
def get_rating(player_name: str):
    # later fetch dynamic ratings from real APIs
    return {"player": player_name, "rating": 80}  # static for now



with open(teamdata_file) as f:
    teamdata = json.load(f)


@app.get("/team-info/{team_name}")
def get_team_info(team_name: str):
    team_name_lower = team_name.lower()

    if team_name_lower in teamdata:
        return teamdata[team_name_lower]
    return {}

