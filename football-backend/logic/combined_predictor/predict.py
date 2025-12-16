import os
import joblib
import pandas as pd
from logic.formation_strength.predict import get_formation_strength

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# History predictor
history_model_path = os.path.join(BASE_DIR, "..", "history_predictor", "models", "history_model.pkl")
history_team_encoder_path = os.path.join(BASE_DIR, "..", "history_predictor", "models", "team_encoder.pkl")
history_winner_encoder_path = os.path.join(BASE_DIR, "..", "history_predictor", "models", "winner_encoder.pkl")

# Player strength predictor
strength_model_path = os.path.join(BASE_DIR, "..", "player_strength", "models", "strength_model.pkl")
strength_result_encoder_path = os.path.join(BASE_DIR, "..", "player_strength", "models", "result_encoder.pkl")
strength_feature_path = os.path.join(BASE_DIR, "..", "player_strength", "models", "model_columns.pkl")

# -----------------------------
# Load models
# -----------------------------
history_model = joblib.load(history_model_path)
history_team_encoder = joblib.load(history_team_encoder_path)
history_winner_encoder = joblib.load(history_winner_encoder_path)

strength_model = joblib.load(strength_model_path)
strength_result_encoder = joblib.load(strength_result_encoder_path)
strength_features = joblib.load(strength_feature_path)

# -----------------------------
# Predict functions
# -----------------------------
def predict_history(team_a, team_b):
    try:
        a_enc = history_team_encoder.transform([team_a])[0]
        b_enc = history_team_encoder.transform([team_b])[0]
    except:
        return None

    X = pd.DataFrame([[a_enc, b_enc]], columns=["Team_A_enc", "Team_B_enc"])
    pred = history_model.predict(X)[0]
    return history_winner_encoder.inverse_transform([pred])[0]


def predict_strength(player_dict):
    row = [player_dict.get(col, 0) for col in strength_features]
    X = pd.DataFrame([row], columns=strength_features)
    pred = strength_model.predict(X)[0]
    return strength_result_encoder.inverse_transform([pred])[0]


# -----------------------------
# Combined Prediction
# -----------------------------
def combine_predictions(
    team_a,
    team_b,
    left_formation,
    right_formation,
    left_playing_11,
    right_playing_11,
    left_rating,
    right_rating
):

    votes = {"Win_A": 0.0, "Win_B": 0.0, "Draw": 0.0}

    # 1️⃣ Historical matchup
    hist_pred = predict_history(team_a, team_b)
    if hist_pred == team_a:
        votes["Win_A"] += 0.35
    elif hist_pred == team_b:
        votes["Win_B"] += 0.35
    else:
        votes["Draw"] += 0.35

    # 2️⃣ Player strength (ML model)
    left_strength = predict_strength(left_playing_11)
    right_strength = predict_strength(right_playing_11)

    if left_strength == "Win":
        votes["Win_A"] += 0.25
    elif left_strength == "Loss":
        votes["Win_B"] += 0.25
    else:
        votes["Draw"] += 0.25

    if right_strength == "Win":
        votes["Win_B"] += 0.25
    elif right_strength == "Loss":
        votes["Win_A"] += 0.25
    else:
        votes["Draw"] += 0.25

    # 3️⃣ Squad ratings
    rating_diff = left_rating - right_rating
    if rating_diff > 0:
        votes["Win_A"] += 0.15
    elif rating_diff < 0:
        votes["Win_B"] += 0.15
    else:
        votes["Draw"] += 0.15

    # 4️⃣ Formation strength (NEW 🔥)
    left_form_score = get_formation_strength(team_a, left_formation)
    right_form_score = get_formation_strength(team_b, right_formation)

    if left_form_score > right_form_score:
        votes["Win_A"] += 0.20
    elif right_form_score > left_form_score:
        votes["Win_B"] += 0.20
    else:
        votes["Draw"] += 0.20

    # -----------------------------
    # Final decision
    # -----------------------------
    winner = max(votes, key=votes.get)

    return (
        team_a if winner == "Win_A"
        else team_b if winner == "Win_B"
        else "Draw"
    )
