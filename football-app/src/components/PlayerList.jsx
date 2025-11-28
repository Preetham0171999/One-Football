// components/PlayerList.jsx
import React from "react";
import { handleDragStart } from "../utils/dragUtils";
import "../styles/PlayerList.css";



export default function PlayerList({ players }) {
  return (
    <div className="player-list-box">
      {players.map((p, idx) => (
        <div
          key={idx}
          className="draggable-player"
          draggable
          onDragStart={(e) => handleDragStart(e, p)}
        >
          {p.name} ({p.position}) ⭐{p.rating}
        </div>
      ))}
    </div>
  );
}
