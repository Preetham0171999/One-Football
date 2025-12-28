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
<img width="1906" height="981" alt="image" src="https://github.com/user-attachments/assets/b37f85b4-54b1-4328-9f61-be55bd889c00" />
<img width="1899" height="968" alt="image" src="https://github.com/user-attachments/assets/f110db8f-d476-43aa-a7d7-7b732b08e62e" />
<img width="1918" height="988" alt="image" src="https://github.com/user-attachments/assets/7d5cd92b-49f7-40be-a4b6-f2f1a2c13086" />
<img width="1900" height="967" alt="image" src="https://github.com/user-attachments/assets/23ddefff-3a20-48ae-9262-a5047b341d4a" />
<img width="1861" height="972" alt="image" src="https://github.com/user-attachments/assets/597ba86b-1033-4d93-95be-38093f039a9e" />








### 1. Install Dependencies
```bash
npm install
Start Frontend
npm start

 Start Backend
cd backend
pip install -r requirements.txt
python app.py
