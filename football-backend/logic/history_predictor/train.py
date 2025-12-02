import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import os

# Paths
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "history_matches.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Create models folder if not exists
os.makedirs(MODEL_DIR, exist_ok=True)

def train_history_model():
    print("📘 Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    # Label encoders
    team_encoder = LabelEncoder()
    winner_encoder = LabelEncoder()

    df["Team_A_enc"] = team_encoder.fit_transform(df["Team_A"])
    df["Team_B_enc"] = team_encoder.fit_transform(df["Team_B"])
    df["Winner_enc"] = winner_encoder.fit_transform(df["Winner"])

    X = df[["Team_A_enc", "Team_B_enc"]]
    y = df["Winner_enc"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("🏋️ Training model...")
    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"✅ Model trained. Accuracy: {accuracy:.2f}")

    # Save model + encoders
    joblib.dump(model, os.path.join(MODEL_DIR, "history_model.pkl"))
    joblib.dump(team_encoder, os.path.join(MODEL_DIR, "team_encoder.pkl"))
    joblib.dump(winner_encoder, os.path.join(MODEL_DIR, "winner_encoder.pkl"))

    print("💾 Saved model and encoders successfully.")

if __name__ == "__main__":
    train_history_model()
