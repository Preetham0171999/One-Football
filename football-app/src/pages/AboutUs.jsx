import React from "react";
import "../styles/auth.css";
import "./StaticPanel.css";

export default function AboutUs() {
  return (
    <div className="auth-page">
      <div className="bg-panel no-bg static-panel">
        <h2 style={{ textAlign: "center" }}>About Us</h2>
        <p style={{ textAlign: "center", color: "#ddd", marginTop: 10 }}>
          OneFootball Arena is a football tactics and match-simulation app.
        </p>

        <div style={{ marginTop: 18, lineHeight: 1.6, color: "#eaeaea" }}>
          <p>
            Build lineups, explore teams and players, and run match predictions
            based on formations and team strength.
          </p>
          <p>
            This project combines a React frontend with a FastAPI backend that
            handles authentication, team/player data, and analysis storage.
          </p>
        </div>
      </div>
    </div>
  );
}
