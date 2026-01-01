import React from "react";
import "../styles/auth.css";
import "./StaticPanel.css";

const API_BASE = "http://127.0.0.1:8000";

export default function Apis() {
  return (
    <div className="auth-page">
      <div className="bg-panel no-bg static-panel">
        <h2 style={{ textAlign: "center" }}>APIs</h2>
        <p style={{ textAlign: "center", color: "#ddd", marginTop: 10 }}>
          Backend base URL: <span style={{ color: "#fff" }}>{API_BASE}</span>
        </p>

        <div style={{ marginTop: 18, lineHeight: 1.7, color: "#eaeaea" }}>
          <h3 style={{ margin: "0 0 10px" }}>Authentication</h3>
          <ul style={{ marginTop: 0 }}>
            <li>POST /auth/signup</li>
            <li>POST /auth/login</li>
            <li>POST /auth/change-password</li>
          </ul>

          <h3 style={{ margin: "16px 0 10px" }}>Teams & Players</h3>
          <ul style={{ marginTop: 0 }}>
            <li>GET /teams</li>
            <li>GET /logo/{"{team_name}"}</li>
            <li>GET /players/{"{team_name}"}</li>
            <li>GET /club-metrics/{"{team_name}"}</li>
            <li>GET /club-history/{"{team_name}"}</li>
          </ul>

          <h3 style={{ margin: "16px 0 10px" }}>Analyses</h3>
          <ul style={{ marginTop: 0 }}>
            <li>POST /analysis</li>
            <li>GET /analysis</li>
            <li>GET /analysis/{"{analysis_id}"}</li>
          </ul>

          <h3 style={{ margin: "16px 0 10px" }}>Predictions & News</h3>
          <ul style={{ marginTop: 0 }}>
            <li>POST /predict</li>
            <li>GET /news/latest</li>
          </ul>

          <p style={{ marginTop: 14, opacity: 0.85 }}>
            Note: Most endpoints require an Authorization Bearer token (after
            login).
          </p>
        </div>
      </div>
    </div>
  );
}
