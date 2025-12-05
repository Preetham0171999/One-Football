import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# -----------------------------
# 1. Load CSVs
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

all_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]
df_list = []

for file in all_files:
    team_df = pd.read_csv(os.path.join(DATA_DIR, file))
    team_name = os.path.splitext(file)[0]
    team_df["Team"] = team_name
    df_list.append(team_df)

df = pd.concat(df_list, ignore_index=True)

# -----------------------------
# 2. Features & label
# -----------------------------
feature_columns = [col for col in df.columns if col.lower() not in ["result", "team"]]

X = df[feature_columns].copy()
y = df["Result"]

# -----------------------------
# 3. Encoders
# -----------------------------
team_encoder = LabelEncoder()
team_enc = team_encoder.fit_transform(df["Team"])
X["Team_enc"] = team_enc

# ADD TO FEATURE LIST
feature_columns.append("Team_enc")

# Encode result
result_encoder = LabelEncoder()
y_encoded = result_encoder.fit_transform(y)

# -----------------------------
# 4. Train model
# -----------------------------
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y_encoded)

# -----------------------------
# 5. SAVE EVERYTHING
# -----------------------------
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, os.path.join(MODEL_DIR, "strength_model.pkl"))
joblib.dump(team_encoder, os.path.join(MODEL_DIR, "team_encoder.pkl"))
joblib.dump(result_encoder, os.path.join(MODEL_DIR, "result_encoder.pkl"))

# THIS IS THE FILE PREDICT.PY USES
joblib.dump(feature_columns, os.path.join(MODEL_DIR, "model_columns.pkl"))

print("Training complete! Saved model_columns:", feature_columns)
