import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import { isAuthenticated } from "../utils/auth";
import "../styles/auth.css";
import "./StaticPanel.css";
import "./Schedule.css";

function normalizeTeam(team) {
  return String(team || "").trim();
}

export default function Schedule() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    authFetch(`/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(Array.isArray(data?.teams) ? data.teams : []))
      .catch((err) => {
        console.error("teams fetch error:", err);
        setTeams([]);
      });
  }, [navigate]);

  useEffect(() => {
    const team = normalizeTeam(selectedTeam);
    if (!team) {
      setFixtures([]);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    authFetch(`/schedule/${encodeURIComponent(team)}`)
      .then(async (res) => {
        if (!res.ok) {
          const maybeJson = await res.json().catch(() => null);
          const detail = maybeJson?.detail || "Failed to load schedule";
          throw new Error(detail);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setFixtures(Array.isArray(data?.fixtures) ? data.fixtures : []);
      })
      .catch((e) => {
        if (cancelled) return;
        setFixtures([]);
        setError(e?.message || "Failed to load schedule");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTeam]);

  return (
    <div className="auth-page">
      <div className="bg-panel no-bg static-panel schedule-panel">
        <h2 style={{ textAlign: "center" }}>Schedule</h2>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="team-dropdown"
          style={{ marginTop: 16 }}
        >
          <option value="">-- Select Team --</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        {selectedTeam && (
          <div style={{ marginTop: 18 }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "#ddd" }}>Loading schedule…</p>
            ) : error ? (
              <p style={{ textAlign: "center", color: "#ddd" }}>{error}</p>
            ) : fixtures.length === 0 ? (
              <p style={{ textAlign: "center", color: "#ddd" }}>
                No schedule available for this team yet.
              </p>
            ) : (
              <ul className="player-list">
                {fixtures.map((f) => (
                  <li key={`${f.date}-${f.opponent}`}>
                    <span style={{ flex: 1 }}>{f.date}</span>
                    <span style={{ flex: 1, textAlign: "center" }}>
                      vs {f.opponent}
                    </span>
                    <span style={{ flex: 1, textAlign: "right" }}>
                      {f.competition}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
