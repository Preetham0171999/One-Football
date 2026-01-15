import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { authFetch } from "../utils/api";

export default function TeamSelector() {
  const navigate = useNavigate();
  const location = useLocation();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [logo, setLogo] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchTeams = async () => {
    try {
      const res = await authFetch(`/teams`);
      const data = await res.json();
      setTeams(Array.isArray(data.teams) ? data.teams : []);
    } catch (err) {
      console.error("teams fetch error:", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const teamFromUrl = params.get("team");
    if (teamFromUrl) setSelectedTeam(teamFromUrl);
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Reset selected player whenever team changes
    setSelectedPlayer(null);
  }, [selectedTeam]);

  

  useEffect(() => {
    if (!isAuthenticated()) return;

    fetchTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;

    const fetchData = async () => {
      try {
        // Fetch players
        const playersRes = await authFetch(`/players/${selectedTeam}`);
        const playersData = await playersRes.json();
        setPlayers(playersData.players);

        // Fetch metrics
        const metricsRes = await authFetch(`/club-metrics/${selectedTeam}`);
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics);

        // Fetch history
        const historyRes = await authFetch(`/club-history/${selectedTeam}`);
        const historyData = await historyRes.json();
        setHistory(historyData.history);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedTeam) return;

    authFetch(`/logo/${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => setLogo(data.logo))
      .catch((err) => console.error("logo fetch error:", err));
  }, [selectedTeam]);

  return (
    <div className="team-selector-page">
      {/* LEFT COLUMN */}
      <div className="team-selector-left">
        {selectedTeam && (
          <div className="club-stats-left">
            <h3>Club Metrics</h3>
            <ul className="metric-list">
              {metrics.map((m, i) => (
                <li key={i}>
                  <span className="metric-name">{m.metric}</span>
                  <span className="metric-value">{m.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedTeam && (
          <div className="club-history-right">
            <h3>Club History</h3>
            <ul className="history-list">
              {history.map((h, i) => (
                <li key={i}>
                  <span className="history-category">{h.category}</span>
                  <span className="history-honour">{h.honour}</span>
                  <span className="history-total">{h.total_wins}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CENTER COLUMN */}
      <div className="team-selector-center">
        <div className="selector-container">
          <div className="team-selector-title-row">
            <h2>Select your football team ⚽</h2>
            <button
              type="button"
              className="add-team-button"
              onClick={() => {
                navigate("/add-team", {
                  state: { from: location.pathname + location.search },
                });
              }}
            >
              + Add Team
            </button>
          </div>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="team-dropdown"
          >
            <option value="">-- Select Team --</option>
            {teams.map((team, idx) => (
              <option key={idx} value={team}>
                {team}
              </option>
            ))}
          </select>

          {selectedTeam && (
            <div className="team-info">
              <div className="team-left">
                <h3>You selected: {selectedTeam}</h3>

                <div className="player-header">
                  <span style={{ flex: 1 }}>Name</span>
                  <span style={{ flex: 1 }}>Position</span>
                  <span style={{ flex: 1, textAlign: "right" }}>Rating</span>
                </div>

                <ul className="player-list">
                  {players.map((player, idx) => (
                    <li
                      key={idx}
                      className={`player-row${
                        selectedPlayer?.name === player.name ? " is-selected" : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlayer(player)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedPlayer(player);
                        }
                      }}
                    >
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">{player.position}</span>
                      <span className="player-rating">{player.rating}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="team-selector-right">
        {selectedTeam && logo && (
          <img src={logo} alt={selectedTeam} className="team-logo-right" />
        )}

        {selectedTeam && (
          <PlayerCard player={selectedPlayer} teamName={selectedTeam} />
        )}
      </div>
    </div>
  );
}

function PlayerCard({ player, teamName }) {
  if (!player) {
    return (
      <div className="player-card player-card-placeholder">
        <div className="player-card-placeholder-title">Player Card</div>
        <div className="player-card-placeholder-text">
          Click any player to view their card.
        </div>
      </div>
    );
  }

  const overall = Number(player.rating) || 0;
  const position = String(player.position || "");
  const positionKey = position.toLowerCase();
  const displayName = String(player.name || "").replace(/_/g, " ");

  const clamp = (value) => Math.max(1, Math.min(99, Math.round(value)));

  const buildStats = () => {
    if (positionKey === "goalkeeper") {
      return {
        DIV: clamp(overall + 1),
        HAN: clamp(overall - 1),
        KIC: clamp(overall - 4),
        REF: clamp(overall + 2),
        SPE: clamp(overall - 8),
        POS: clamp(overall - 2),
      };
    }

    if (positionKey === "defender") {
      return {
        PAC: clamp(overall - 2),
        SHO: clamp(overall - 10),
        PAS: clamp(overall - 2),
        DRI: clamp(overall - 6),
        DEF: clamp(overall + 7),
        PHY: clamp(overall + 4),
      };
    }

    if (positionKey === "midfielder") {
      return {
        PAC: clamp(overall + 1),
        SHO: clamp(overall - 2),
        PAS: clamp(overall + 5),
        DRI: clamp(overall + 3),
        DEF: clamp(overall - 4),
        PHY: clamp(overall - 3),
      };
    }

    // forward / default
    return {
      PAC: clamp(overall + 3),
      SHO: clamp(overall + 4),
      PAS: clamp(overall - 2),
      DRI: clamp(overall + 2),
      DEF: clamp(overall - 12),
      PHY: clamp(overall - 2),
    };
  };

  const stats = buildStats();
  const statEntries = Object.entries(stats);

  return (
    <div className="player-card" aria-label="Selected player card">
      <div className="player-card-header">
        <div className="player-card-overall">{overall}</div>
        <div className="player-card-meta">
          <div className="player-card-position">{position}</div>
          <div className="player-card-team">{teamName}</div>
        </div>
      </div>

      <div className="player-card-name">{displayName}</div>

      <div className="player-card-stats">
        {statEntries.map(([label, value]) => (
          <div className="player-card-stat" key={label}>
            <span className="player-card-stat-value">{value}</span>
            <span className="player-card-stat-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
