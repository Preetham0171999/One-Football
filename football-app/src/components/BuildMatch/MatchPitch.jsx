import React from "react";
import "../../styles/Pitch.css";
import "./MatchPitch.css";
import TeamHalf from "./TeamHalf";

export default function MatchPitch({
  assigned,
  formationPoints,
  players,
  allPlayers,
  onDropLeft,
  onDropRight,
}) {
  return (
    <div className="pitch-container match-mode">
      {/* TOP PENALTY BOX */}
      <div className="penalty-box top-box"></div>

      <TeamHalf
        team="top"
        points={formationPoints.left}
        assigned={assigned.left}
        players={players.left}
        allPlayers={allPlayers.left}
        onDrop={onDropLeft}
        color="#3276ff"
      />

      {/* Center line & circle */}
      <div className="center-line"></div>
      <div className="center-circle"></div>

      <TeamHalf
        team="bottom"
        points={formationPoints.right}
        assigned={assigned.right}
        players={players.right}
        allPlayers={allPlayers.right}
        onDrop={onDropRight}
        color="#ff4040"
      />

      {/* BOTTOM PENALTY BOX */}
      <div className="penalty-box bottom-box"></div>
    </div>
  );
}
