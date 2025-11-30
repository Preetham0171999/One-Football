import React, { useState, useMemo, useRef, useEffect } from "react";
import PlayerList from "../../components/PlayerList";
import MatchPitch from "./MatchPitch";
import LineupControls from "../../components/LineupControls";
import { createHandleDrop } from "../../utils/dragUtils";
import { getFormationCoordinates } from "../../utils/formationUtils";
import "./BuildMatch.css";

export default function BuildMatch() {
  const [teams, setTeams] = useState([]);

  // LEFT TEAM
  const [leftTeam, setLeftTeam] = useState("");
  const [leftPlayers, setLeftPlayers] = useState([]);
  const [leftAllPlayers, setLeftAllPlayers] = useState([]);
  const [leftAssigned, setLeftAssigned] = useState({});
  const [leftFormation, setLeftFormation] = useState("4-3-3");
  const [leftTeamRating, setLeftTeamRating] = useState(0);



  // RIGHT TEAM
  const [rightTeam, setRightTeam] = useState("");
  const [rightPlayers, setRightPlayers] = useState([]);
  const [rightAllPlayers, setRightAllPlayers] = useState([]);
  const [rightAssigned, setRightAssigned] = useState({});
  const [rightFormation, setRightFormation] = useState("4-3-3");
  const [rightTeamRating, setRightTeamRating] = useState(0);

  const formations = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "4-2-3-1": { defense: 4, midfield: 5, attack: 1 },
  };

  const pitchRef = useRef(null);

  function getRoles(formation) {
    const [d, m, a] = formation.split("-").map(Number);
    return [
      "goalkeeper",
      ...Array(d).fill("defense"),
      ...Array(m).fill("midfield"),
      ...Array(a).fill("attack"),
    ];
  }

  // LOAD TEAM LIST
  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams));
  }, []);

  // LEFT TEAM PLAYERS
  useEffect(() => {
    if (!leftTeam) return;

    fetch(`http://localhost:8000/players/${leftTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setLeftPlayers(data.players || []);
        setLeftAllPlayers(data.players || []);
      });
  }, [leftTeam]);

  // RIGHT TEAM PLAYERS
  useEffect(() => {
    if (!rightTeam) return;

    fetch(`http://localhost:8000/players/${rightTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setRightPlayers(data.players || []);
        setRightAllPlayers(data.players || []);
      });
  }, [rightTeam]);

  // FORMATION COORDINATES FOR BOTH TEAMS → COMBINED ON ONE PITCH
  const leftCoords = useMemo(
    () => getFormationCoordinates(leftFormation),
    [leftFormation]
  );
  const rightCoords = useMemo(
    () => getFormationCoordinates(rightFormation),
    [rightFormation]
  );

  // DRAG-DROP HANDLERS
  const leftHandleDrop = useMemo(
    () =>
      createHandleDrop({
        formationPoints: leftCoords,
        setAssigned: setLeftAssigned,
        setPlayers: setLeftPlayers,
        playerList: [...leftAllPlayers, ...leftPlayers],
        formationRoles: getRoles(leftFormation),
        setTeamRating: setLeftTeamRating,
      }),
    [leftCoords, leftAllPlayers, leftPlayers, leftFormation]
  );

  const rightHandleDrop = useMemo(
    () =>
      createHandleDrop({
        formationPoints: rightCoords,
        setAssigned: setRightAssigned,
        setPlayers: setRightPlayers,
        playerList: [...rightAllPlayers, ...rightPlayers],
        formationRoles: getRoles(rightFormation),
        setTeamRating: setRightTeamRating,
      }),
    [rightCoords, rightAllPlayers, rightPlayers, rightFormation]
  );

  return (
  <div className="build-match-container">
    <h1 className="match-title">⚔️ Build Match</h1>

    <div className="match-outer-grid">
      
      {/* LEFT SIDE */}
      <div className="side-wrapper">
        <LineupControls
          teams={teams}
          formations={formations}
          selectedTeam={leftTeam}
          setSelectedTeam={setLeftTeam}
          formation={leftFormation}
          setFormation={setLeftFormation}
        />

        <PlayerList players={leftPlayers} title="Team A Players" />
      </div>

      {/* CENTER PITCH */}
      <MatchPitch
        assigned={{ left: leftAssigned, right: rightAssigned }}
        formationPoints={{ left: leftCoords, right: rightCoords }}
        players={{ left: leftPlayers, right: rightPlayers }}
        allPlayers={{ left: leftAllPlayers, right: rightAllPlayers }}
        onDropLeft={leftHandleDrop}
        onDropRight={rightHandleDrop}
      />

      {/* RIGHT SIDE */}
      <div className="side-wrapper">
        <LineupControls
          teams={teams}
          formations={formations}
          selectedTeam={rightTeam}
          setSelectedTeam={setRightTeam}
          formation={rightFormation}
          setFormation={setRightFormation}
        />

        <PlayerList players={rightPlayers} title="Team B Players" />
      </div>
    </div>
  </div>
);

}
