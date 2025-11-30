// src/components/TeamHalf.jsx
import React from "react";

/**
 * TeamHalf - renders either the top or bottom half of the pitch.
 *
 * Props:
 * - team: "top" | "bottom"
 * - points: formation points array [{ xPercent, yPercent }, ...]
 * - assigned: object mapping index => playerName
 * - players: array of team players
 * - allPlayers: array of all players (for lookup)
 * - onDrop: drop handler for this half
 * - color: player dot color
 *
 * This version applies:
 *  - a small center-pull on X (same for both sides)
 *  - a mirrored & lifted Y for the bottom side
 *  - clamps top/left to safe bounds so dots don't escape the pitch
 */
export default function TeamHalf({
  team,
  points = [],
  assigned = {},
  players = [],
  allPlayers = [],
  onDrop,
  color = "#ffffff88",
}) {
  // tweak these to taste
  const centerPull = 0.95;       // 1.0 = no pull, <1 pulls toward center X
  const topScale = 1.05;         // how much top team is pushed inward
  const bottomScale = 1.05;      // how much bottom team is pushed inward (mirrored)
  const bottomLiftPct = 6;       // *pull bottom team upward by this many percent*
  const minTop = 3;              // don't allow top < 3%
  const maxTop = 97;             // don't allow top > 97%
  const minLeft = 2;
  const maxLeft = 98;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  return (
    <div
      className={`pitch-half ${team === "top" ? "top-half" : "bottom-half"}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {points.map((point, index) => {
        const playerName = assigned[index];
        const playerObj = [...players, ...allPlayers].find(
          (p) => p && p.name === playerName
        );

        // Horizontal: pull toward center
        const adjustedLeft = 50 + (point.xPercent - 50) * centerPull;

        // Vertical: top team uses direct scale; bottom is mirrored then lifted upward
        let adjustedTop;
        if (team === "top") {
          adjustedTop = point.yPercent * topScale;
        } else {
          // mirror vertically, then push upward by bottomLiftPct
          adjustedTop = 50 + (50 - point.yPercent) * bottomScale - bottomLiftPct;
        }

        // Clamp to safe bounds so dots/info-cards never go out of pitch
        const leftPct = clamp(adjustedLeft, minLeft, maxLeft);
        const topPct = clamp(adjustedTop, minTop, maxTop);

        return (
          <div
            key={`${team}-${index}`}
            className="player-dot-wrapper"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
            }}
          >
            {playerObj && (
              <div className={`player-info-card ${team}`}>
                <strong>{playerObj.name}</strong>
                <br />
                {playerObj.position} — ⭐{playerObj.rating}
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
