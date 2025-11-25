// components/LineupControls.jsx
import React from "react";

export default function LineupControls({
  selectedTeam,
  teams,
  formation,
  formations,
  setSelectedTeam,
  setFormation
}) {
  return (
    <>
      {/* TEAM DROPDOWN */}
      <div className="selector-container">
        <h2>Select Club ⚽</h2>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="team-dropdown"
        >
          <option value="">-- Select Team --</option>
          {teams.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* FORMATION DROPDOWN */}
      <div className="formation-box">
        <label>Select Formation:</label>

        <select
          value={formation}
          onChange={(e) => setFormation(e.target.value)}
        >
          {Object.keys(formations).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </>
  );
}
