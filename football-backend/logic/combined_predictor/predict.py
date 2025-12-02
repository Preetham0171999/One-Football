import os
import joblib
import pandas as pd
import numpy as np

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
strength_feature_path = os.path.join(BASE_DIR, "..", "player_strength", "models", "feature_columns.pkl")
strength_team_encoder_path = os.path.join(BASE_DIR, "..", "player_strength", "models", "team_encoder.pkl")

# -----------------------------
# Load models
# -----------------------------
history_model = joblib.load(history_model_path)
history_team_encoder = joblib.load(history_team_encoder_path)
history_winner_encoder = joblib.load(history_winner_encoder_path)

strength_model = joblib.load(strength_model_path)
strength_result_encoder = joblib.load(strength_result_encoder_path)
strength_features = joblib.load(strength_feature_path)

# **THE FIX — Load the actual team encoder**
strength_team_encoder = joblib.load(strength_team_encoder_path)


# -----------------------------
# Predict functions
# -----------------------------
def predict_history(team_a, team_b):
    try:
        a_enc = history_team_encoder.transform([team_a])[0]
        b_enc = history_team_encoder.transform([team_b])[0]
    except:
        return None  # unknown team → we pretend history never happened

    X_input = pd.DataFrame([[a_enc, b_enc]],
                           columns=["Team_A_enc", "Team_B_enc"])
    pred = history_model.predict(X_input)[0]
    return history_winner_encoder.inverse_transform([pred])[0]


def predict_strength(team_name, player_dict):

    # Encode team
    try:
        team_enc = strength_team_encoder.transform([team_name])[0]
    except:
        team_enc = 0  # fallback (like giving the team a default passport)

    # Build full input row
    row = [team_enc] + [player_dict.get(player, 0) for player in strength_features]

    X_input = pd.DataFrame([row], columns=["Team_enc"] + strength_features)

    pred = strength_model.predict(X_input)[0]
    return strength_result_encoder.inverse_transform([pred])[0]


def combine_predictions(team_a, team_b, left_playing_11, right_playing_11, left_rating, right_rating):
    """
    left_playing_11, right_playing_11: dict of 15 players {name: 1/0}
    left_rating, right_rating: float or int
    """

    # -----------------------------
    # 1. History prediction
    # -----------------------------
    hist_pred = predict_history(team_a, team_b)

    # -----------------------------
    # 2. Player strength model
    # -----------------------------
    left_strength = predict_strength(team_a, left_playing_11)
    right_strength = predict_strength(team_b, right_playing_11)

    # -----------------------------
    # 3. Combine weights
    # -----------------------------
    votes = {"Win_A": 0, "Win_B": 0, "Draw": 0}

    # History (40%)
    if hist_pred == team_a:
        votes["Win_A"] += 0.4
    elif hist_pred == team_b:
        votes["Win_B"] += 0.4
    else:
        votes["Draw"] += 0.4

    # Player strength (30% + 30%)
    if left_strength == "Win":
        votes["Win_A"] += 0.3
    elif left_strength == "Loss":
        votes["Win_B"] += 0.3
    else:
        votes["Draw"] += 0.3

    if right_strength == "Win":
        votes["Win_B"] += 0.3
    elif right_strength == "Loss":
        votes["Win_A"] += 0.3
    else:
        votes["Draw"] += 0.3

    # Rating weight (20%)
    rating_diff = left_rating - right_rating
    if rating_diff > 0:
        votes["Win_A"] += 0.2
    elif rating_diff < 0:
        votes["Win_B"] += 0.2
    else:
        votes["Draw"] += 0.2

    # -----------------------------
    # Final prediction
    # -----------------------------
    winner = max(votes, key=votes.get)

    if winner == "Win_A":
        return team_a
    elif winner == "Win_B":
        return team_b
    else:
        return "Draw"
