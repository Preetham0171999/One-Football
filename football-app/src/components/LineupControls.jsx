import React from "react";

export default function LineupControls({
  teams = [],
  formations = {},
  selectedTeam,
  formation,
  setSelectedTeam,
  setFormation
}) {
  return (
    <div className="selector-wrapper">

      {/* TEAM DROPDOWN */}
      <div className="selector-container">
        <h2>Select Your Football Team ⚽</h2>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="team-dropdown"
        >
          <option value="">-- Select Team --</option>

          {Array.isArray(teams) &&
            teams.map((team, idx) => (
              <option key={idx} value={team}>
                {team}
              </option>
            ))}
        </select>
      </div>

      {/* FORMATION SELECTOR */}
      <div className="formation-box">
        <label>Select Formation:</label>

        <select
          value={formation}
          onChange={(e) => setFormation(e.target.value)}
        >
          {formations &&
            Object.keys(formations).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
