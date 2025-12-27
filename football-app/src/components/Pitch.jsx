// components/Pitch.jsx
import React from "react";
// import "./TeamBuilder.css";
import "../styles/Pitch.css";

export default function Pitch({
  formationPoints,
  assigned,
  players,
  allPlayers,
  onDrop,
}) {
  return (
    <div
      className="pitch-container"
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain");
        let player = null;
        try {
          player = raw ? JSON.parse(raw) : null;
        } catch (err) {
          console.error("Invalid drag payload:", err);
        }

        // call provided handler with event + player object
        onDrop?.(e, player);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="penalty-box left"></div>
      <div className="center-line"></div>
      <div className="center-circle"></div>
      <div className="penalty-box right"></div>

      {formationPoints.map((p, index) => {
        const playerName = assigned[index];
        const playerObj = [...players, ...allPlayers].find(
          (pl) => pl.name === playerName
        );

        return (
          <div
            key={index}
            className="player-dot-wrapper"
            style={{
              left: p.xPercent + "%",
              top: p.yPercent + "%",
            }}
          >
            {playerObj && (
              <div className="player-info-card">
                <strong>{playerObj.name}</strong>
                <br />
                {playerObj.position} — ⭐{playerObj.rating}
              </div>
            )}

            <div
              className="player-dot"
              style={{ background: playerObj ? "#ffd700" : "#ffffff88" }}
            />
          </div>
        );
      })}
    </div>
  );
}
