import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import "./StaticPanel.css";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="bg-panel no-bg static-panel dashboard-panel">
        <h2 style={{ textAlign: "center" }}>Welcome to OneFootball Arena</h2>
        <p style={{ textAlign: "center", color: "#ddd", marginTop: 6 }}>
          Where tactics are forged, legends are built, and matches are won before
          kickoff.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" onClick={() => navigate("/team")}>
              Explore Teams
            </button>
            <button className="btn-primary" onClick={() => navigate("/build-team")}>
              Craft Your XI
            </button>
            <button className="btn-primary" onClick={() => navigate("/build-match")}>
              Simulate Matchday
            </button>
            <button className="btn-primary" onClick={() => navigate("/strategies")}>
              Strategies
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" onClick={() => navigate("/schedule")}>
              Schedule
            </button>
            <button className="btn-primary" onClick={() => navigate("/live-scores")}>
              Live Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
