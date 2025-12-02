import pandas as pd
import joblib
import os

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Load model + encoders
model = joblib.load(os.path.join(MODEL_DIR, "history_model.pkl"))
team_encoder = joblib.load(os.path.join(MODEL_DIR, "team_encoder.pkl"))
winner_encoder = joblib.load(os.path.join(MODEL_DIR, "winner_encoder.pkl"))

def predict_result(teamA, teamB):
    try:
        a = team_encoder.transform([teamA])[0]
        b = team_encoder.transform([teamB])[0]
    except:
        return "Unknown team — add to historical dataset!"

    X_input = pd.DataFrame([[a, b]], columns=["Team_A_enc", "Team_B_enc"])
    pred = model.predict(X_input)[0]
    winner = winner_encoder.inverse_transform([pred])[0]

    return winner

# Example usage
if __name__ == "__main__":
    print("Prediction:", predict_result("Barcelona", "Liverpool"))
