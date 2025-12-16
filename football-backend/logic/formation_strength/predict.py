import pandas as pd
import os

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "formation_strength.csv")

df = pd.read_csv(DATA_PATH)

def get_formation_strength(Team: str, Formation: str):
    team = Team.strip().lower()
    formation = Formation.strip()
    
    

    df["Team_norm"] = df["Team"].str.strip().str.lower()
    df["Formation_norm"] = df["Formation"].str.strip()

    row = df[
        (df["Team_norm"] == team) &
        (df["Formation_norm"] == formation)
    ]
    
    
    

    if row.empty:
        print("❌ Formation NOT FOUND:", team, formation)
        return 0.0

    win = row.iloc[0]["Winning_Rate"]
    draw = row.iloc[0]["Draw_Rate"]
    lose = row.iloc[0]["Losing_Rate"]

    score = (win * 1.0) + (draw * 0.4) - (lose * 0.6)
    return round(score, 3)

