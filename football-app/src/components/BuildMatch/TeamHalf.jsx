import React from "react";

export default function TeamHalf({
  team,
  points = [],
  assigned = {}, // index → playerName
  allPlayers = [],
  onDrop,
  onRemovePlayer,
  color = "#ffffff88",
  reverse = false,
}) {
  const centerPull = 1.35;
  const topScale = 1.05;
  const bottomScale = 1.05;
  const bottomLiftPct = 6;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  return (
    <div
      className={`pitch-half ${team === "top" ? "top-half" : "bottom-half"}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();

        const raw = e.dataTransfer.getData("text/plain");
        if (!raw) return;

        const player = JSON.parse(raw);
        onDrop?.(e, player, team); // pass EVENT + player
      }}
    >
      {points.map((point, index) => {
        const playerName = assigned[index];
        const player =
          playerName && allPlayers.find((p) => p.name === playerName);

        const adjustedLeft = 50 + (point.xPercent - 50) * centerPull;

        let adjustedTop;
        if (team === "top") {
          adjustedTop = point.yPercent * topScale;
        } else {
          adjustedTop = reverse
            ? 100 - point.yPercent * bottomScale - bottomLiftPct
            : 50 + (50 - point.yPercent) * bottomScale - bottomLiftPct;
        }

        const leftPct = clamp(adjustedLeft, 2, 98);
        const topPct = clamp(adjustedTop, 3, 97);

        return (
          <div
            key={`${team}-${index}`}
            className="player-dot-wrapper"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            {player && (
              <div
                className={`player-info-card ${team}`}
                // onClick={(e) => {
                //   e.stopPropagation();
                //   onRemovePlayer?.(player.name, index);
                // }}

                onClick={() => onRemovePlayer(player.name, index)}

              >
                <strong>{player.name}</strong>
                <br />
                {player.position?.charAt(0)} — ⭐{player.rating}
              </div>
            )}

            <div
              className="player-dot"
              style={{
                background: player ? color : "#ffffff88",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
