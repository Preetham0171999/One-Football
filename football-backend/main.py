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

def load_json(filename):
    with open(os.path.join(BASE_DIR, "data", filename), "r") as f:
        return json.load(f)

teams_data = load_json("teams.json")
players_data = load_json("players.json")
logos_data = load_json("logos.json")
ratings_data = load_json("playerRatings.json") 

# 1️⃣ Get all teams
@app.get("/teams")
def get_teams():
    return {"teams": teams_data}

# 2️⃣ Get logo for a team
@app.get("/logo/{team_name}")
def get_logo(team_name: str):
    return {"team": team_name, "logo": logos_data.get(team_name, None)}

# 3️⃣ Get players for a team
# @app.get("/players/{team_name}")
# def get_players(team_name: str):
#     players = players_data.get(team_name, [])

#     result = []
#     for player in players:
#         result.append({
#             "name": player,
#             "rating": ratings_data.get(player, "N/A")
#         })

#     return {"team": team_name, "players": result}

@app.get("/players/{team_name}")
def get_players(team_name: str):
    players = players_data.get(team_name, [])
    return {"team": team_name, "players": players}




# 4️⃣ Get player rating (optional)
@app.get("/rating/{player_name}")
def get_rating(player_name: str):
    # later fetch dynamic ratings from real APIs
    return {"player": player_name, "rating": 80}  # static for now
