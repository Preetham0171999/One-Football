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
  const [prediction, setPrediction] = useState(null);

  const formations = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "4-2-3-1": { defense: 4, midfield: 5, attack: 1 },
  };

  const pitchRef = useRef(null);

  function getFormationRoles(formation) {
    const [d, m, a] = formation.split("-").map(Number);
    return [
      "goalkeeper",
      ...Array(d).fill("defense"),
      ...Array(m).fill("midfield"),
      ...Array(a).fill("attack"),
    ];
  }

  const formationRoles = useMemo(
    () => getFormationRoles(formation),
    [formation]
  );

  // Load teams
  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams))
      .catch((err) => console.error("TEAMS API ERROR:", err));
  }, []);

  // Load players for selected team
  useEffect(() => {
    if (!selectedTeam) return;

    fetch(`http://localhost:8000/players/${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || []);
        setAllPlayers(data.players || []);
      })
      .catch((err) => console.error("PLAYERS API ERROR:", err));
  }, [selectedTeam]);

  // Formation point generator
  const formationPoints = useMemo(
    () => getFormationCoordinates(formation) || [],
    [formation]
  );

  const handleDrop = useMemo(
    () =>
      createHandleDrop({
        formationPoints,
        setAssigned,
        setPlayers,
        playerList: [...allPlayers, ...players],
        formationRoles,
        setTeamRating,
      }),
    [formationPoints, setAssigned, setPlayers, players, allPlayers, formationRoles]
  );

  // ⭐ ML Prediction API Call
  const handleAnalyze = async () => {
    if (!allPlayers.length) return;

    const payload = {};

    allPlayers.forEach((player) => {
      const isPlaying = Object.values(assigned).some(
        (p) => p?.name === player.name
      );
      payload[player.key] = isPlaying ? 1 : 0;
    });

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setPrediction(data.prediction);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

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

      {selectedTeam && (
        <div className="team-rating-box">
          <h2>Team Rating: ⭐ {teamRating}</h2>
        </div>
      )}

      <button className="analyze-btn" onClick={handleAnalyze}>
        Analyze Result
      </button>

      {prediction && (
        <h2 className="prediction-text">Predicted Result: {prediction}</h2>
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
