import json
from database.db import SessionLocal
from database.models import Team, Player, ClubMetric, ClubHistory

db = SessionLocal()

# Teams + logos
teams = json.load(open("data/teams.json"))
logos = json.load(open("data/logos.json"))

for team in teams:
    exists = db.query(Team).filter(Team.name == team).first()
    if not exists:
        db.add(Team(name=team, logo=logos.get(team)))

# Players
players_data = json.load(open("data/players.json"))

for team, players in players_data.items():
    for p in players:
        exists = db.query(Player).filter(
            Player.name == p["name"], Player.team == team
        ).first()
        if not exists:
            db.add(Player(
                name=p["name"],
                team=team,
                position=p["position"],
                rating=p["rating"]
            ))


# Metrics
metrics = json.load(open("data/clubMetrics.json"))
for team, m in metrics.items():
    exists = db.query(ClubMetric).filter(ClubMetric.team == team).first()
    if not exists:
        db.add(ClubMetric(team=team, metrics=m))

# History
history = json.load(open("data/history.json"))
for team, h in history.items():
    exists = db.query(ClubHistory).filter(ClubHistory.team == team).first()
    if not exists:
        db.add(ClubHistory(team=team, history=h))

db.commit()
db.close()
