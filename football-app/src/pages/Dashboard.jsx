import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="bg-panel no-bg">
        <h2 style={{ textAlign: "center" }}>Welcome to OneFootball Arena</h2>
        <p style={{ textAlign: "center", color: "#ddd", marginTop: 6 }}>
          Where tactics are forged, legends are built, and matches are won before
          kickoff.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          <button className="btn-primary" onClick={() => navigate("/team")}>
            Explore Teams
          </button>
          <button className="btn-primary" onClick={() => navigate("/build-team")}>
            Craft Your XI
          </button>
          <button className="btn-primary" onClick={() => navigate("/build-match")}>
            Simulate Matchday
          </button>
        </div>
      </div>
    </div>
  );
}
