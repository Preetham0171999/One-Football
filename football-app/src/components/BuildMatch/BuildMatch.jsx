import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";
import { authFetch } from "../../utils/api";
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
    if (!isAuthenticated()) return;

    authFetch(`/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data.teams))
      .catch((err) => console.error("teams fetch error:", err));

    if (leftTeam) {
      authFetch(`/logo/${leftTeam}`)
        .then((res) => res.json())
        .then((data) => setLeftLogo(data.logo))
        .catch((err) => console.error("left logo error:", err));
    }

    if (rightTeam) {
      authFetch(`/logo/${rightTeam}`)
        .then((res) => res.json())
        .then((data) => setRightLogo(data.logo))
        .catch((err) => console.error("right logo error:", err));
    }
  }, [leftTeam, rightTeam]);

  // Fetch players for left/right teams
useEffect(() => {
  if (leftTeam) {
    if (!isAuthenticated()) return;
    authFetch(`/players/${leftTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setLeftPlayers(data.players || []);
        setLeftAllPlayers(data.players || []);
      })
      .catch((err) => console.error("left players error:", err));
  }
}, [leftTeam]);

useEffect(() => {
  if (rightTeam) {
    if (!isAuthenticated()) return;
    authFetch(`/players/${rightTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setRightPlayers(data.players || []);
        setRightAllPlayers(data.players || []);
      })
      .catch((err) => console.error("right players error:", err));
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
      const res = await authFetch(`/predict`, {
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
