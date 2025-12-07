// src/components/TeamHalf.jsx
import React from "react";

export default function TeamHalf({
  team,
  points = [],
  assigned = {},
  players = [],
  allPlayers = [],
  onDrop,
  color = "#ffffff88",
  reverse = false,
  onRemovePlayer,      // parent-controlled removal
}) {
  const centerPull = 1.35;
  const topScale = 1.05;
  const bottomScale = 1.05;
  const bottomLiftPct = 6;
  const minTop = 3;
  const maxTop = 97;
  const minLeft = 2;
  const maxLeft = 98;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  return (
    <div
      className={`pitch-half ${team === "top" ? "top-half" : "bottom-half"} ${reverse ? "reverse" : ""}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {points.map((point, index) => {
        const playerName = assigned[index];
        const playerObj = [...players, ...allPlayers].find(p => p && p.name === playerName);

        const adjustedLeft = 50 + (point.xPercent - 50) * centerPull;
        let adjustedTop;
        if (team === "top") {
          adjustedTop = point.yPercent * topScale;
        } else {
          adjustedTop = reverse
            ? 100 - point.yPercent * bottomScale - bottomLiftPct
            : 50 + (50 - point.yPercent) * bottomScale - bottomLiftPct;
        }

        const leftPct = clamp(adjustedLeft, minLeft, maxLeft);
        const topPct = clamp(adjustedTop, minTop, maxTop);

        return (
          <div
            key={`${team}-${index}`}
            className="player-dot-wrapper"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            {playerObj && (
              <div
                className={`player-info-card ${team}`}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`[TeamHalf] Clicked player:`, playerObj.name, "at index", index);
                  if (onRemovePlayer) {
                    onRemovePlayer(playerObj.name, index);
                  }
                }}
              >
                <div className="info-content">
                  <strong>{playerObj.name}</strong>
                  <br />
                  {playerObj.position?.charAt(0)} — ⭐{playerObj.rating}
                  <br />
                  {/* <small>Click to remove</small> */}
                </div>
              </div>
            )}
            <div
              className="player-dot"
              style={{ background: playerObj ? color : "#ffffff88" }}
            />
          </div>
        );
      })}
    </div>
  );
}
