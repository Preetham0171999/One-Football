import React, { useState, useMemo, useRef, useEffect } from "react";
import "../../styles/Pitch.css";
import "./MatchPitch.css";
import TeamHalf from "./TeamHalf";
import {
  formationMap,
  getFormationCoordinates,
  formationRoles,
} from "../../utils/formationUtils";

// import React from "react";
// import "../../styles/Pitch.css";
// import "./MatchPitch.css";
// import TeamHalf from "./TeamHalf";
import { buildTeamFromAssigned, getTeamRatings } from "../../utils/ratingUtils";

export default function MatchPitch({
  assigned,
  players,
  allPlayers,
  formationPoints,
  formationRoles,
  onDropLeft,
  onDropRight,
  setAssignedLeft,
  setAssignedRight,
  setPlayersLeft,
  setPlayersRight,
  setTeamRatingLeft,
  setTeamRatingRight,
}) {
  const handleRemovePlayer = (side, playerName, index) => {
    if (side === "left") {
      // Remove from assigned slots
      setAssignedLeft((prev) => ({ ...prev, [index]: undefined }));

      // Return player to player list
      const playerObj = allPlayers.left.find((p) => p.name === playerName);
      if (playerObj) {
        setPlayersLeft((prev) => [...prev, playerObj]);
      }

      // Recalculate team rating
      const updatedAssigned = { ...assigned.left, [index]: undefined };
      const { team } = buildTeamFromAssigned(
        updatedAssigned,
        allPlayers.left,
        formationRoles.left
      );
      setTeamRatingLeft(getTeamRatings(team).average);
    }

    if (side === "right") {
      setAssignedRight((prev) => ({ ...prev, [index]: undefined }));

      const playerObj = allPlayers.right.find((p) => p.name === playerName);
      if (playerObj) {
        setPlayersRight((prev) => [...prev, playerObj]);
      }

      const updatedAssigned = { ...assigned.right, [index]: undefined };
      const { team } = buildTeamFromAssigned(
        updatedAssigned,
        allPlayers.right,
        formationRoles.right
      );
      setTeamRatingRight(getTeamRatings(team).average);
    }
  };

  return (
    <div className="pitch-container match-mode">
      <div className="penalty-box top-box"></div>

      {/* LEFT / TOP TEAM */}
      <TeamHalf
        team="top"
        points={formationPoints.left}
        assigned={assigned.left}
        players={players.left}
        allPlayers={allPlayers.left}
        onDrop={onDropLeft}
        onRemovePlayer={(playerName, index) =>
          handleRemovePlayer("left", playerName, index)
        }
        setAssigned={setAssignedLeft}
        setPlayers={setPlayersLeft}
        playerList={allPlayers.left}
        formationRoles={formationRoles.left}
        setTeamRating={setTeamRatingLeft}
        color="#3276ff"
      />

      <div className="center-line"></div>
      <div className="center-circle"></div>

      {/* RIGHT / BOTTOM TEAM */}
      <TeamHalf
        team="bottom"
        points={formationPoints.right}
        assigned={assigned.right}
        players={players.right}
        allPlayers={allPlayers.right}
        onDrop={onDropRight}
        onRemovePlayer={(playerName, index) =>
          handleRemovePlayer("right", playerName, index)
        }
        setAssigned={setAssignedRight}
        setPlayers={setPlayersRight}
        playerList={allPlayers.right}
        formationRoles={formationRoles.right}
        setTeamRating={setTeamRatingRight}
        color="#ff4040"
        reverse
      />
      <div className="penalty-box bottom-box"></div>
    </div>
  );
}
