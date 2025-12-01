// components/PlayerList.jsx
import React from "react";
import { handleDragStart } from "../utils/dragUtils";
import RatingMeter from "./RatingMeter";
import "../styles/PlayerList.css";

export default function PlayerList({ players = [], title }) {

  const positionMap = {
    goalkeeper: "goalkeeper",
    defender: "defense",
    midfielder: "midfield",
    forward: "attack"
  };

  // Group players by position
  const grouped = {
    goalkeeper: [],
    defense: [],
    midfield: [],
    attack: []
  };

  players.forEach(player => {
    const pos = player.position.toLowerCase();
    const key = positionMap[pos];
    if (grouped[key]) grouped[key].push(player);
  });

  const sections = [
    { key: "goalkeeper", label: "Goalkeepers" },
    { key: "defense", label: "Defenders" },
    { key: "midfield", label: "Midfielders" },
    { key: "attack", label: "Attackers" }
  ];

  return (
    <div className="player-list-container">
      <h3 className="player-list-title">{title}</h3>

      {sections.map((sec) => (
        grouped[sec.key].length > 0 && (
          <div className="player-section" key={sec.key}>
            <h4 className="player-section-title">{sec.label}</h4>

            {grouped[sec.key].map((player, idx) => (
              <div
                key={idx}
                className="player-item"
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
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
      ))}
    </div>
  );
}
