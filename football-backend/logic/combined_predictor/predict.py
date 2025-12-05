import os
import joblib
import pandas as pd

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
strength_features = joblib.load(strength_feature_path)   # <-- FIXED

# -----------------------------
# Predict functions
# -----------------------------
def predict_history(team_a, team_b):
    try:
        a_enc = history_team_encoder.transform([team_a])[0]
        b_enc = history_team_encoder.transform([team_b])[0]
    except:
        return None

    X_input = pd.DataFrame([[a_enc, b_enc]], columns=["Team_A_enc", "Team_B_enc"])
    pred = history_model.predict(X_input)[0]
    return history_winner_encoder.inverse_transform([pred])[0]


def predict_strength(team_name, player_dict):
    row = []
    for col in strength_features:
        row.append(player_dict.get(col, 0))

    X_input = pd.DataFrame([row], columns=strength_features)
    pred = strength_model.predict(X_input)[0]
    return strength_result_encoder.inverse_transform([pred])[0]


def combine_predictions(team_a, team_b, left_playing_11, right_playing_11, left_rating, right_rating):
    hist_pred = predict_history(team_a, team_b)

    left_strength = predict_strength(team_a, left_playing_11)
    right_strength = predict_strength(team_b, right_playing_11)

    votes = {"Win_A": 0, "Win_B": 0, "Draw": 0}

    # History
    if hist_pred == team_a:
        votes["Win_A"] += 0.4
    elif hist_pred == team_b:
        votes["Win_B"] += 0.4
    else:
        votes["Draw"] += 0.4

    # Left team strength
    if left_strength == "Win":
        votes["Win_A"] += 0.3
    elif left_strength == "Loss":
        votes["Win_B"] += 0.3
    else:
        votes["Draw"] += 0.3

    # Right team strength
    if right_strength == "Win":
        votes["Win_B"] += 0.3
    elif right_strength == "Loss":
        votes["Win_A"] += 0.3
    else:
        votes["Draw"] += 0.3

    # Ratings
    diff = left_rating - right_rating
    if diff > 0:
        votes["Win_A"] += 0.2
    elif diff < 0:
        votes["Win_B"] += 0.2
    else:
        votes["Draw"] += 0.2

    winner = max(votes, key=votes.get)
    return team_a if winner == "Win_A" else team_b if winner == "Win_B" else "Draw"
