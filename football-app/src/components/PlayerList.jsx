// components/PlayerList.jsx
import React, { useMemo } from "react";
import RatingMeter from "./RatingMeter";
import "../styles/PlayerList.css";

export default function PlayerList({ players = [], title }) {
  /**
   * Remove null / undefined placeholders
   * (Pitch uses empty slots — PlayerList should ignore them)
   */
  const safePlayers = useMemo(
    () => players.filter(Boolean),
    [players]
  );

  const positionMap = {
    goalkeeper: "goalkeeper",
    defender: "defense",
    midfielder: "midfield",
    forward: "attack",
  };

  const grouped = {
    goalkeeper: [],
    defense: [],
    midfield: [],
    attack: [],
  };

  safePlayers.forEach((player) => {
    if (!player) return;
    const pos = player.position?.toLowerCase();
    const key = positionMap[pos];
    if (key && grouped[key]) {
      grouped[key].push(player);
    }
  });

  const sections = [
    { key: "goalkeeper", label: "Goalkeepers" },
    { key: "defense", label: "Defenders" },
    { key: "midfield", label: "Midfielders" },
    { key: "attack", label: "Attackers" },
  ];

  return (
    <div className="player-list-container">
      <h3 className="player-list-title">{title}</h3>

      {sections.map(
        (sec) =>
          grouped[sec.key].length > 0 && (
            <div className="player-section" key={sec.key}>
              <h4 className="player-section-title">{sec.label}</h4>

              {grouped[sec.key].map((player) => (
                <div
                  key={player.name}
                  className="player-item"
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData(
                      "text/plain",
                      JSON.stringify(player)
                    );
                    console.log("DragStart:", player);
                  }}
                >
                  <RatingMeter rating={player.rating} />

                  <div className="player-info">
                    <strong>{player.name}</strong>
                    <div className="player-meta">
                      {player.position} • ⭐{player.rating}
                    </div>
                  </div>

                  <RatingMeter rating={player.rating} />
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}
