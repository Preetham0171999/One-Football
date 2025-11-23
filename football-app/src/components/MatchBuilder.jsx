import React, { useEffect, useState } from "react";
import "./MatchBuilder.css";

export default function MatchBuilder() {
  const [teams, setTeams] = useState([]);

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");

  const [homeLogo, setHomeLogo] = useState("");
  const [awayLogo, setAwayLogo] = useState("");

  // Load team list
  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then(res => res.json())
      .then(data => setTeams(data.teams));
  }, []);

  // Fetch logo for selected home team
  useEffect(() => {
    if (!homeTeam) return;

    fetch(`http://localhost:8000/logo/${homeTeam}`)
      .then(res => res.json())
      .then(data => setHomeLogo(data.logo));
  }, [homeTeam]);

  // Fetch logo for selected away team
  useEffect(() => {
    if (!awayTeam) return;

    fetch(`http://localhost:8000/logo/${awayTeam}`)
      .then(res => res.json())
      .then(data => setAwayLogo(data.logo));
  }, [awayTeam]);

  return (
    <div className="match-builder-container">
      <h1>Create a Match ⚽</h1>

      <div className="match-select-row">

        {/* HOME TEAM */}
        <div className="team-column">
          <h3>Home Team</h3>

          <select
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            className="team-dropdown"
          >
            <option value="">-- Select Team --</option>
            {teams.map((team, idx) => (
              <option key={idx} value={team}>
                {team}
              </option>
            ))}
          </select>

          {homeTeam && (
            <>
              <p className="team-name">{homeTeam}</p>
              <img src={homeLogo} alt={homeTeam} className="team-logo" />
            </>
          )}
        </div>

        {/* VS */}
        <div className="vs-box">
          <h2>VS</h2>
        </div>

        {/* AWAY TEAM */}
        <div className="team-column">
          <h3>Away Team</h3>

          <select
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            className="team-dropdown"
          >
            <option value="">-- Select Team --</option>
            {teams.map((team, idx) => (
              <option key={idx} value={team}>
                {team}
              </option>
            ))}
          </select>

          {awayTeam && (
            <>
              <p className="team-name">{awayTeam}</p>
              <img src={awayLogo} alt={awayTeam} className="team-logo" />
            </>
          )}
        </div>

      </div>

      {(homeTeam && awayTeam) && (
        <button className="start-match-btn">
          Start Match
        </button>
      )}
    </div>
  );
}
