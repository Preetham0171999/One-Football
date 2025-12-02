import pandas as pd
import joblib
import os

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

model_path = os.path.join(MODEL_DIR, "strength_model.pkl")
team_encoder_path = os.path.join(MODEL_DIR, "team_encoder.pkl")
result_encoder_path = os.path.join(MODEL_DIR, "result_encoder.pkl")

# -----------------------------
# Load model + encoders
# -----------------------------
model = joblib.load(model_path)
team_encoder = joblib.load(team_encoder_path)
result_encoder = joblib.load(result_encoder_path)

# -----------------------------
# Load model columns (saved during training)
# -----------------------------
columns_path = os.path.join(MODEL_DIR, "model_columns.pkl")
model_columns = joblib.load(columns_path)  # List of columns used in training

# -----------------------------
# Prediction function
# -----------------------------
def predict_strength(team_name, player_dict):
    """
    team_name -> "Barcelona", "PSG", etc.
    player_dict -> {"M_ter_Stegen":1, "J_Kounde":1, ...}
    """

    if team_name not in team_encoder.classes_:
        return "Unknown team — add to dataset!"

    team_enc = team_encoder.transform([team_name])[0]

    # Build input row with correct column order
    row = []
    for col in model_columns:
        if col == "Team_enc":
            row.append(team_enc)
        else:
            # Missing player? Fill with 0
            row.append(player_dict.get(col, 0))

    X_input = pd.DataFrame([row], columns=model_columns)

    pred = model.predict(X_input)[0]
    result = result_encoder.inverse_transform([pred])[0]

    return result
