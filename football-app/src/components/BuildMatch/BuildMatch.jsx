import React, { useState, useMemo, useEffect } from "react";
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
  const [leftLogo, setLeftLogo] = useState("");

  // RIGHT TEAM
  const [rightTeam, setRightTeam] = useState("");
  const [rightPlayers, setRightPlayers] = useState([]);
  const [rightAllPlayers, setRightAllPlayers] = useState([]);
  const [rightAssigned, setRightAssigned] = useState({});
  const [rightFormation, setRightFormation] = useState("4-3-3");
  const [rightTeamRating, setRightTeamRating] = useState(0);
  const [rightLogo, setRightLogo] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const formations = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "4-2-3-1": { defense: 4, midfield: 5, attack: 1 },
  };

  // Utility to generate roles for drag/drop logic
  function getRoles(formation) {
    const [d, m, a] = formation.split("-").map(Number);
    return [
      "goalkeeper",
      ...Array(d).fill("defense"),
      ...Array(m).fill("midfield"),
      ...Array(a).fill("attack"),
    ];
  }

  // Fetch teams and logos
  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams));

    if (leftTeam) {
      fetch(`http://localhost:8000/logo/${leftTeam}`)
        .then((res) => res.json())
        .then((data) => setLeftLogo(data.logo));
    }

    if (rightTeam) {
      fetch(`http://localhost:8000/logo/${rightTeam}`)
        .then((res) => res.json())
        .then((data) => setRightLogo(data.logo));
    }
  }, [leftTeam, rightTeam]);

  // Fetch players for left/right teams
useEffect(() => {
  if (leftTeam) {
    fetch(`http://localhost:8000/players/${leftTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setLeftPlayers(data.players || []);
        setLeftAllPlayers(data.players || []);
      });
  }
}, [leftTeam]);

useEffect(() => {
  if (rightTeam) {
    fetch(`http://localhost:8000/players/${rightTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setRightPlayers(data.players || []);
        setRightAllPlayers(data.players || []);
      });
  }
}, [rightTeam]);





  // Formation coordinates
  const leftCoords = useMemo(
    () => getFormationCoordinates(leftFormation),
    [leftFormation]
  );
  const rightCoords = useMemo(
    () => getFormationCoordinates(rightFormation),
    [rightFormation]
  );

  const mirroredRightCoords = useMemo(
    () => rightCoords.map((p) => ({ ...p, yPercent: 100 - p.yPercent })),
    [rightCoords]
  );

  // Drag & drop handlers
  const leftHandleDrop = useMemo(
    () =>
      createHandleDrop({
        formationPoints: leftCoords,
        setAssigned: setLeftAssigned,
        setPlayers: setLeftPlayers,
        playerList: leftAllPlayers,
        formationRoles: getRoles(leftFormation),
        setTeamRating: setLeftTeamRating,
      }),
    [leftCoords, leftAllPlayers, leftPlayers, leftFormation]
  );

  const rightHandleDrop = useMemo(
    () =>
      createHandleDrop({
        formationPoints: mirroredRightCoords,
        setAssigned: setRightAssigned,
        setPlayers: setRightPlayers,
        playerList: [...rightAllPlayers, ...rightPlayers],
        formationRoles: getRoles(rightFormation),
        setTeamRating: setRightTeamRating,
      }),
    [mirroredRightCoords, rightAllPlayers, rightPlayers, rightFormation]
  );

  const memoAllPlayers = useMemo(
  () => ({ left: leftAllPlayers, right: rightAllPlayers }),
  [leftAllPlayers, rightAllPlayers]
);

const memoFormationPoints = useMemo(
  () => ({
    left: getFormationCoordinates(leftFormation),
    right: getFormationCoordinates(rightFormation),
  }),
  [leftFormation, rightFormation]
);





  // Prediction
  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    const payload = {
      team_a: leftTeam,
      team_b: rightTeam,
        left_formation: leftFormation,     // 🔥 ADD
  right_formation: rightFormation, 
      left_playing_11: leftAssigned,
      right_playing_11: rightAssigned,
      left_rating: leftTeamRating,
      right_rating: rightTeamRating,
    };
    console.log("Prediction payload:", payload);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        
      });
      const data = await res.json();
      setPrediction(data.winner || "Unknown");
    } catch (err) {
      setPrediction("Network error");
    }

    setLoading(false);
  };

          console.log("BUILD leftAllPlayers:", leftAllPlayers);
console.log("BUILD rightAllPlayers:", rightAllPlayers);


// const memoFormationRoles = useMemo(
//   () => ({
//     left: formationRoles[leftFormation],
//     right: formationRoles[rightFormation],
//   }),
//   [leftFormation, rightFormation]
// );

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
            logo={leftLogo}
            teamRating={leftTeamRating}
          />
          <PlayerList players={leftPlayers} title="Team A Players" />
        </div>

        {/* CENTER PITCH */}

        <div className="center-wrapper">
          <MatchPitch
            assigned={{ left: leftAssigned, right: rightAssigned }}
            players={{ left: leftPlayers, right: rightPlayers }}
            allPlayers={memoAllPlayers}
            formationPoints={memoFormationPoints}
            formationRoles={{
              left: getRoles(leftFormation),
              right: getRoles(rightFormation),
            }}
            onDropLeft={leftHandleDrop}
            onDropRight={rightHandleDrop}
            setAssignedLeft={setLeftAssigned}
            setAssignedRight={setRightAssigned}
            setPlayersLeft={setLeftPlayers}
            setPlayersRight={setRightPlayers}
            setTeamRatingLeft={setLeftTeamRating}
            setTeamRatingRight={setRightTeamRating}
          />

          <div className="predict-wrapper">
            <button className="predict-btn" onClick={handlePredict}>
              🔮 Predict Winner
            </button>
            {loading && <p>Loading prediction...</p>}
            {prediction && (
              <p className="prediction-result">
                🏆 Predicted Result: <strong>{prediction}</strong>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="side-wrapper">
          <LineupControls
            teams={teams}
            formations={formations}
            selectedTeam={rightTeam}
            setSelectedTeam={setRightTeam}
            formation={rightFormation}
            setFormation={setRightFormation}
            logo={rightLogo}
            teamRating={rightTeamRating}
          />
          <PlayerList players={rightPlayers} title="Team B Players" />
        </div>
      </div>
    </div>
  );
}
