import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# -----------------------------
# 1. Load CSV
# -----------------------------
df = pd.read_csv("data/rivals.csv")   # Your file name

# -----------------------------
# 2. Encode team names
# -----------------------------
team_encoder = LabelEncoder()
winner_encoder = LabelEncoder()

df["Team_A_enc"] = team_encoder.fit_transform(df["Team_A"])
df["Team_B_enc"] = team_encoder.fit_transform(df["Team_B"])
df["Winner_enc"] = winner_encoder.fit_transform(df["Winner"])

# -----------------------------
# 3. Prepare training data
# -----------------------------
X = df[["Team_A_enc", "Team_B_enc"]]
y = df["Winner_enc"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# 4. Train the ML model
# -----------------------------
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

print("Model accuracy:", model.score(X_test, y_test))

# -----------------------------
# 5. Prediction function
# -----------------------------
def predict_result(teamA, teamB):
    try:
        a = team_encoder.transform([teamA])[0]
        b = team_encoder.transform([teamB])[0]
    except:
        return "Unknown team — add to dataset!"

    X_input = pd.DataFrame([[a, b]], columns=["Team_A_enc", "Team_B_enc"])
    pred = model.predict(X_input)[0]
    return winner_encoder.inverse_transform([pred])[0]


# -----------------------------
# Example predictions
# -----------------------------
# print("Prediction: ", predict_result("Barcelona", "Liverpool"))
# print("Prediction: ", predict_result("Arsenal", "PSG"))
