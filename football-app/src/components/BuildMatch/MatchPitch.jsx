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

  // LEFT team reset — only when left changes
  useEffect(() => {
    if (!allPlayers.left?.length) return;
    setAssignedLeft({});
    setPlayersLeft(allPlayers.left);
    setSubs((prev) => ({ ...prev, left: [] }));
  }, [allPlayers.left]);

  // RIGHT team reset — only when right changes
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
        setSubs,
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
        setSubs,
        side: "right",
        playerList: allPlayers.right,
        formationRoles: formationRoles.right,
        setTeamRating: setTeamRatingRight,
      }),
    [formationPoints.right, allPlayers.right, formationRoles.right]
  );

  // Remove player from pitch
  const handleRemovePlayer = (side, playerName, index) => {
    const isLeft = side === "left";
    const setAssigned = isLeft ? setAssignedLeft : setAssignedRight;
    const setPlayers = isLeft ? setPlayersLeft : setPlayersRight;
    const teamAssigned = isLeft ? assigned.left : assigned.right;
    const teamPlayers = isLeft ? allPlayers.left : allPlayers.right;
    const setTeamRating = isLeft ? setTeamRatingLeft : setTeamRatingRight;
    const roles = isLeft ? formationRoles.left : formationRoles.right;

    // Remove from assigned
    setAssigned((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });

    // Send back to available player list
    const playerObj = teamPlayers.find((p) => p.name === playerName);
    if (playerObj) setPlayers((prev) => [...prev, playerObj]);

    // Recalculate team rating
    const updatedAssigned = { ...teamAssigned };
    delete updatedAssigned[index];
    const { team } = buildTeamFromAssigned(updatedAssigned, teamPlayers, roles);
    setTeamRating(getTeamRatings(team).average);
  };

  return (
    <div className="pitch-wrapper">
  {/* LEFT SUBS */}
  <div className="subs-row left-subs">
    {subs.left.map((player, i) => (
      <div
        key={`${player.name}-${i}`}
        className="sub-item"
        draggable
        onDragStart={(e) =>
          e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ player, side: "left", subIndex: i })
          )
        }
      >
        <span className="sub-icon">🔄</span>
        <div className="sub-dot">{player.position?.[0]}</div>
        <div className="sub-name">{player.name.replace("_", " ")}</div>
      </div>
    ))}
  </div>

  {/* PITCH */}
  <div className="pitch-container match-mode">
    <div className="penalty-box top-box" />
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
        key={`${player.name}-${i}`}
        className="sub-item"
        draggable
        onDragStart={(e) =>
          e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ player, side: "right", subIndex: i })
          )
        }
      >
        <span className="sub-icon">🔄</span>
        <div className="sub-dot">{player.position?.[0]}</div>
        <div className="sub-name">{player.name.replace("_", " ")}</div>
      </div>
    ))}
  </div>
</div>

  );
}
