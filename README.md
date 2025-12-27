# ⚽ One-Football Project

A web-based football analytics platform that allows users to view team details, perform single-match analysis, build matches dynamically, and predict match outcomes using AI models.

---

## 🏟 Features

### 1. Team Details
- View all teams with logos, players, and ratings.
- Explore detailed metrics for each player (position, rating, stats).
- Supports multiple teams with dynamic data from backend.

### 2. Single Match Analysis
- Analyze a match between any two teams.
- See formation, player positions, and overall team ratings.
- Compare metrics like attack, defense, and midfield efficiency.
- Visual representation of the pitch with players positioned dynamically.

### 3. Build Match
- Select squads from available players to create your own match.
- Drag-and-drop players to assign them to positions on the pitch.
- Substitutions supported with real-time updates on team ratings.
- Separate handling for left and right teams to maintain independent states.

### 4. AI-Based Winner Prediction
- Multiple machine learning models run in the backend to predict the match winner.
- Models consider:
  - Team ratings
  - Player statistics
  - Historical performance
- Real-time prediction updated as you build the match.

---

## 🛠 Technology Stack

- **Frontend:** React.js, CSS (custom pitch & player visualization)
- **Backend:** Python (Flask/FastAPI) serving team/player data and AI predictions
- **AI Models:** Multiple Python-based models analyzing team strength and probability of winning
- **State Management:** React hooks with independent pitch/substitution state
- **Version Control:** Git + GitHub

---

## ⚡ Screenshots
<img width="1899" height="909" alt="image" src="https://github.com/user-attachments/assets/d1b78590-effc-4e6b-a590-e02354dd72f1" />

<img width="1902" height="891" alt="Screenshot 2025-12-15 134836" src="https://github.com/user-attachments/assets/769cc30c-f8a4-40f0-a97d-5159cec81728" />
<img width="1058" height="857" alt="image" src="https://github.com/user-attachments/assets/e913fcd1-09b4-4c60-85e6-ddc1177b76fa" />
<img width="1909" height="989" alt="image" src="https://github.com/user-attachments/assets/db13ec8e-7127-4005-b1c8-72b60f783633" />


### 1. Install Dependencies
```bash
npm install
Start Frontend
npm start

 Start Backend
cd backend
pip install -r requirements.txt
python app.py
