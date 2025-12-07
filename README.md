Overview
This project lets football fans, analysts, and developers build custom lineups, create matchups, and get AI-powered match predictions.
Users can assemble squads from scratch, drag-and-drop players into formations, and let the ML engine analyze player ratings, team history, and additional factors to predict the likely winner.

🚀 Core Features
🔧 Team Builder
Pick any supported club and view the full squad, including positions, ratings, and roles.
Build your custom starting XI with a clean drag-and-drop UI.
Supports multiple formations like 4-3-3, 4-4-2, 3-5-2, etc.
Real-time team rating calculation based on chosen players.

🎮 Match Builder
Select Team A vs Team B and build both sides.
Drag players directly to the pitch.
Remove/replace players instantly with a single click.
Formation mirrored automatically for both sides of the pitch.
Displays live team strength based on selected lineup.

🤖 AI/ML Prediction Engine
ML model analyses:
Player ratings
Team performance history
Lineup strength
Formation impact
Other custom features
Generates a match winner prediction within seconds.
Clean JSON API for predictions (backend).

🔄 Smart Data Integration
Fetch real-time team logos
Player list per club
Dynamic coordinate mapping for formations
Modular utils for future upgrades (formation roles, pitch system, etc.)

🛠️ Tech Stack
Frontend:
React
Custom drag-and-drop system
Dynamic formation rendering
Reusable components (TeamHalf, PlayerList, MatchPitch…)
Backend:
FastAPI
Custom ML model
Endpoints for:
Fetching teams
Getting players
Team logo fetching
Match prediction

🖥️ How It Works
Pick Team A & B
Choose formations
Drag players onto the pitch
Click “Predict Winner”
Backend ML returns likely winner
UI displays the final predicted result
