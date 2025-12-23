import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getToken } from "../utils/auth";
import { authFetch } from "../utils/api";

export default function TeamSelector() {
  const navigate = useNavigate();

  const goToBuilder = () => {
    navigate("/build-team");
  };

    const goToMatchBuilder = () => {
    navigate("/build-match");
  };

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [logo, setLogo] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [history, setHistory] = useState([]);

  const [teamInfo, setTeamInfo] = useState({});
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!selectedTeam) return;

    const token = getToken();
    authFetch(`/team-info/${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => setTeamInfo(data))
      .catch((err) => console.error("team-info error:", err));
  }, [selectedTeam]);

  const [moreInfoVisible, setMoreInfoVisible] = useState(false);

  const hideMoreInfo = () => {
    setMoreInfoVisible(false);
  };

  useEffect(() => {
    if (!selectedTeam) return;

    fetch(`http://localhost:8000/team-info/${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => setTeamInfo(data));
  }, [selectedTeam]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const token = getToken();
    authFetch(`/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data.teams))
      .catch((err) => console.error("teams fetch error:", err));
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;

    const fetchData = async () => {
      try {
        // Fetch players
        const token = getToken();
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
    <>
      <div className="kick-in-ball"></div>

      {selectedTeam && (
        <div className="more-info-box">
          <button className="more-info-btn" onClick={goToBuilder}>
            {showMoreInfo ? "Hide Info" : "Build Team"}
          </button>

          <button className="more-info-btn" onClick={goToMatchBuilder}>
        Build Match
      </button>

          {/* Collapsible content */}
          {showMoreInfo && (
            <div className="more-info-content">
              <h3>More About {selectedTeam}</h3>
              <p>{teamData.description}</p>

              <h4>Fun Facts</h4>
              <ul>
                {teamData.fun_facts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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

      {selectedTeam && (
        <img src={logo} alt={selectedTeam} className="team-logo-right" />
      )}

      <div className="selector-container">
        <h2>Select your football team ⚽</h2>

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
                  <li key={idx}>
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
    </>
  );
}
