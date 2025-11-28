import React, { useState, useMemo, useRef, useEffect } from "react";
import PlayerList from "../components/PlayerList";
import Pitch from "../components/Pitch";
import LineupControls from "../components/LineupControls";
import { createHandleDrop } from "../utils/dragUtils";
import { getFormationCoordinates } from "../utils/formationUtils";
import "./TeamBuilder.css";


export default function TeamBuilder() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [assigned, setAssigned] = useState({});
  const [formation, setFormation] = useState("4-3-3");
  const [teamRating, setTeamRating] = useState(0);


  // Local formation metadata (used for roles)
  const formations = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "4-2-3-1": { defense: 4, midfield: 5, attack: 1 },
  };

  const pitchRef = useRef(null);

  function getFormationRoles(formation) {
  const [d, m, a] = formation.split("-").map(Number);
  const roles = [];

  // goalkeeper always slot 0
  roles.push("goalkeeper");

  // defense
  for (let i = 0; i < d; i++) roles.push("defense");

  // midfield
  for (let i = 0; i < m; i++) roles.push("midfield");

  // attack
  for (let i = 0; i < a; i++) roles.push("attack");

  return roles;
}

const formationRoles = useMemo(
  () => getFormationRoles(formation),
  [formation]
);


  // 🟦 Load teams on mount
  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then(res => res.json())
      .then(data => {
        console.log("Loaded teams:", data);
        setTeams(data.teams);
      })
      .catch(err => console.error("TEAMS API ERROR:", err));
  }, []);

  // 🟦 Fetch players when a team is selected
useEffect(() => {
  if (!selectedTeam) return;

  fetch(`http://localhost:8000/players/${selectedTeam}`)
    .then(res => res.json())
    .then(data => {
      console.log("Loaded players:", data);
      setPlayers(data.players || []);
      setAllPlayers(data.players || []);
    })
    .catch(err => console.error("PLAYERS API ERROR:", err));

}, [selectedTeam]);


  // 🟦 Formation Coordinate Generator
  const formationPoints = useMemo(
    () => getFormationCoordinates(formation) || [],
    [formation]
  );

  // 🟦 Drop Handler
const handleDrop = useMemo(
  () =>
    createHandleDrop({
      formationPoints,
      setAssigned,
      setPlayers,
      playerList: [...allPlayers, ...players],
      formationRoles,
      setTeamRating
    }),
  [formationPoints, setAssigned, setPlayers, players, allPlayers, formationRoles]
);



  return (
  <div className="team-builder-container">

    <LineupControls
      teams={teams}
      formations={formations}
      selectedTeam={selectedTeam}
      setSelectedTeam={setSelectedTeam}
      formation={formation}
      setFormation={setFormation}
    />

    {/* ⭐ Display Rating Always When Team Selected */}
    {selectedTeam && (
      <div className="team-rating-box">
        <h2>Team Rating: ⭐ {teamRating}</h2>
      </div>
    )}

    {selectedTeam && (
      <div className="builder-layout">
        <PlayerList players={players} />

        <Pitch
          pitchRef={pitchRef}
          formationPoints={formationPoints}
          assigned={assigned}
          players={players}
          allPlayers={allPlayers}
          onDrop={handleDrop}
        />
      </div>
    )}
  </div>
);

}
