import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# -----------------------------
# 1. Load CSV (flexible multi-team support)
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# Concatenate all team CSVs in the folder
all_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]
df_list = []

for file in all_files:
    team_df = pd.read_csv(os.path.join(DATA_DIR, file))
    # Add team column from filename
    team_name = os.path.splitext(file)[0]
    team_df["Team"] = team_name
    df_list.append(team_df)

df = pd.concat(df_list, ignore_index=True)

# -----------------------------
# 2. Separate features & label
# -----------------------------
# Columns except Result & Team are player names
feature_columns = [col for col in df.columns if col.lower() not in ["result", "team"]]

X = df[feature_columns].copy()
y = df["Result"]

# -----------------------------
# 3. Encode categorical data
# -----------------------------
# Encode team
# Encode team as numeric and append
team_encoder = LabelEncoder()
team_enc = team_encoder.fit_transform(df["Team"])
X["Team_enc"] = team_enc

# Encode result
result_encoder = LabelEncoder()
y_encoded = result_encoder.fit_transform(y)

# -----------------------------
# 4. Train model
# -----------------------------
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y_encoded)

# -----------------------------
# 5. Save model + encoders + feature columns
# -----------------------------
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, os.path.join(MODEL_DIR, "strength_model.pkl"))
joblib.dump(result_encoder, os.path.join(MODEL_DIR, "result_encoder.pkl"))
joblib.dump(team_encoder, os.path.join(MODEL_DIR, "team_encoder.pkl"))
joblib.dump(feature_columns, os.path.join(MODEL_DIR, "feature_columns.pkl"))

print("Player strength model trained successfully with multiple teams!")
