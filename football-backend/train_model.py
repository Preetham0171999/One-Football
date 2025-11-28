import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# Load CSV
df = pd.read_csv("data/matches.csv")

# Identify label column
label_column = "Result"

# Encode labels: Win = 1, Loss = 0
df[label_column] = df[label_column].map({"Win": 1, "Loss": 0})

# Feature columns = all except result
feature_columns = [c for c in df.columns if c != label_column]

X = df[feature_columns]
y = df[label_column]

# Split (optional but useful)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Accuracy (prints in console)
preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))

# Save model in models folder
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/win_predictor.pkl")

print("Model training complete. Saved as models/win_predictor.pkl")
