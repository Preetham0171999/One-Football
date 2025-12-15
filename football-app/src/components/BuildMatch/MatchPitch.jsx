import React, { useState, useEffect, useMemo } from "react";
import "../../styles/Pitch.css";
import "./MatchPitch.css";
import TeamHalf from "./TeamHalf";
import { buildTeamFromAssigned, getTeamRatings } from "../../utils/ratingUtils";
import { createHandleDrop } from "../../utils/dragUtils";

export default function MatchPitch({
  assigned,
  players,
  allPlayers,
  formationPoints,
  formationRoles,
  setAssignedLeft,
  setAssignedRight,
  setPlayersLeft,
  setPlayersRight,
  setTeamRatingLeft,
  setTeamRatingRight,
}) {
  const [subs, setSubs] = useState({ left: [], right: [] });

  // Reset pitch & subs when team changes
// LEFT team reset — runs ONLY when left team changes
useEffect(() => {
  if (!allPlayers.left?.length) return;

  setAssignedLeft({});
  setPlayersLeft(allPlayers.left);
  setSubs((prev) => ({ ...prev, left: [] }));
}, [allPlayers.left]);


// RIGHT team reset — runs ONLY when right team changes
useEffect(() => {
  if (!allPlayers.right?.length) return;

  setAssignedRight({});
  setPlayersRight(allPlayers.right);
  setSubs((prev) => ({ ...prev, right: [] }));
}, [allPlayers.right]);


  // Drop handlers
 const onDropLeft = useMemo(
  () =>
    createHandleDrop({
      formationPoints: formationPoints.left,
      setAssigned: setAssignedLeft,
      setPlayers: setPlayersLeft,
      setSubs, // pass the full setter
      side: "left",
      playerList: allPlayers.left,
      formationRoles: formationRoles.left,
      setTeamRating: setTeamRatingLeft,
    }),
  [formationPoints.left, allPlayers.left, formationRoles.left]
);

const onDropRight = useMemo(
  () =>
    createHandleDrop({
      formationPoints: formationPoints.right,
      setAssigned: setAssignedRight,
      setPlayers: setPlayersRight,
      setSubs, // pass the full setter
      side: "right",
      playerList: allPlayers.right,
      formationRoles: formationRoles.right,
      setTeamRating: setTeamRatingRight,
    }),
  [formationPoints.right, allPlayers.right, formationRoles.right]
);


  // Remove player from pitch & optionally send back to subs/playerList
  const handleRemovePlayer = (side, playerName, index) => {
    if (side === "left") {
      setAssignedLeft(prev => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });

      const playerObj = allPlayers.left.find(p => p.name === playerName);
      if (playerObj) setPlayersLeft(prev => [...prev, playerObj]);

      const updatedAssigned = { ...assigned.left };
      delete updatedAssigned[index];
      const { team } = buildTeamFromAssigned(updatedAssigned, allPlayers.left, formationRoles.left);
      setTeamRatingLeft(getTeamRatings(team).average);
    } else {
      setAssignedRight(prev => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });

      const playerObj = allPlayers.right.find(p => p.name === playerName);
      if (playerObj) setPlayersRight(prev => [...prev, playerObj]);

      const updatedAssigned = { ...assigned.right };
      delete updatedAssigned[index];
      const { team } = buildTeamFromAssigned(updatedAssigned, allPlayers.right, formationRoles.right);
      setTeamRatingRight(getTeamRatings(team).average);
    }
  };

  return (
    <div className="pitch-wrapper">
      {/* LEFT SUBS */}
      <div className="subs-row left-subs">
        {subs.left.map((player, i) => (
          <div
            key={player.name}
            className="sub-dot"
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "text/plain",
                JSON.stringify({ player, side: "left", subIndex: i })
              )
            }
          >
            {player.position?.[0]}
          </div>
        ))}
      </div>

      <div className="pitch-container match-mode">
        <div className="penalty-box top-box" />

        {/* LEFT / TOP */}
        <TeamHalf
          team="top"
          points={formationPoints.left}
          assigned={assigned.left}
          players={players.left}
          allPlayers={allPlayers.left}
          onDrop={onDropLeft}
          onRemovePlayer={(name, idx) => handleRemovePlayer("left", name, idx)}
          color="#3276ff"
        />

        <div className="center-line" />
        <div className="center-circle" />

        {/* RIGHT / BOTTOM */}
        <TeamHalf
          team="bottom"
          points={formationPoints.right}
          assigned={assigned.right}
          players={players.right}
          allPlayers={allPlayers.right}
          onDrop={onDropRight}
          onRemovePlayer={(name, idx) => handleRemovePlayer("right", name, idx)}
          color="#ff4040"
          reverse
        />

        <div className="penalty-box bottom-box" />
      </div>

      {/* RIGHT SUBS */}
      <div className="subs-row right-subs">
        {subs.right.map((player, i) => (
          <div
            key={player.name}
            className="sub-dot"
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "text/plain",
                JSON.stringify({ player, side: "right", subIndex: i })
              )
            }
          >
            {player.position?.[0]}
          </div>
        ))}
      </div>
    </div>
  );
}
