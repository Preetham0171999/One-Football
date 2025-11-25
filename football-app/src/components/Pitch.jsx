// components/Pitch.jsx
import React from "react";

export default function Pitch({
  formationPoints,
  assigned,
  players,
  allPlayers,
  handleDrop
}) {
  return (
    <div
      className="pitch-container"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="penalty-box top"></div>
      <div className="center-line"></div>
      <div className="center-circle"></div>
      <div className="penalty-box bottom"></div>

      {formationPoints.map((p, index) => {
        const playerName = assigned[index];
        const playerObj = [...players, ...allPlayers].find(
          pl => pl.name === playerName
        );

        return (
          <div
            key={index}
            className="player-dot-wrapper"
            style={{
              left: p.xPercent + "%",
              top: p.yPercent + "%"
            }}
          >
            {playerObj && (
              <div className="player-info-card">
                <strong>{playerObj.name}</strong><br />
                {playerObj.position} — ⭐{playerObj.rating}
              </div>
            )}

            <div className="player-dot"
              style={{ background: playerObj ? "#ffd700" : "#ffffff88" }}
            />
          </div>
        );
      })}
    </div>
  );
}
