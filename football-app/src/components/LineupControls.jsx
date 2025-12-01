import React from "react";
import TeamRatingDisplay from "./TeamRatingDisplay";
import "../styles/LineupControls.css";

export default function LineupControls({
  teams = [],
  formations = {},
  selectedTeam,
  formation,
  setSelectedTeam,
  setFormation,
  logo,
  teamRating   // <-- new
}) {
  return (
    <div className="selector-wrapper">

      {/* TEAM SELECTOR + LOGO + RATING */}
      <div className="selector-container">

        <div className="team-display-row">
          
          {/* Logo */}
          {logo && (
            <img 
              src={logo} 
              alt={selectedTeam} 
              className="team-logo"
            />
          )}

          {/* Title */}
          <h2 className="team-title">Select Your Football Team ⚽</h2>

          {/* Rating meter (only after team selected) */}
          {selectedTeam && (
            <div className="team-rating-wrapper">
              <TeamRatingDisplay rating={teamRating} />
            </div>
          )}

        </div>

        {/* Team Dropdown */}
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
          {Object.keys(formations).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}
