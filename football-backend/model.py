import joblib
import numpy as np
import pandas as pd

# Load model
model = joblib.load("models/win_predictor.pkl")

# Player order MUST match training CSV
PLAYER_COLUMNS = [
    "M_ter_Stegen", "R_Araujo", "J_Kounde", "P_Cubarsi", "A_Balde",
    "A_Christensen", "Pedri", "F_de_Jong", "Gavi", "I_Gundogan",
    "F_Lopez", "R_Lewandowski", "L_Yamal", "Raphinha", "F_Torres"
]

def predict_outcome(player_input: dict):
    """
    player_input = {
        "M_ter_Stegen": 1,
        "R_Araujo": 1,
        ...
    }
    """
    # Convert to DataFrame in correct order
    row = [player_input.get(col, 0) for col in PLAYER_COLUMNS]
    df = pd.DataFrame([row], columns=PLAYER_COLUMNS)

    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][prediction]

    return {
        "prediction": "Win" if prediction == 1 else "Loss",
        "confidence": float(probability)
    }
