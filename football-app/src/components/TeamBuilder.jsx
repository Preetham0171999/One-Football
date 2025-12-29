import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { authFetch } from "../utils/api";
import PlayerList from "../components/PlayerList";
import Pitch from "../components/Pitch";
import LineupControls from "../components/LineupControls";

import { createHandleDrop } from "../utils/dragUtils";
import { getFormationCoordinates } from "../utils/formationUtils";
import { buildTeamFromAssigned, getTeamRatings } from "../utils/ratingUtils";
import "./TeamBuilder.css";

export default function TeamBuilder() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [logo, setLogo] = useState("");
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [assigned, setAssigned] = useState({});
  const [subs, setSubs] = useState({ right: [] });
  const [formation, setFormation] = useState("4-3-3");
  const [teamRating, setTeamRating] = useState(0);
  const [prediction, setPrediction] = useState(null);

  const [movePlayersEnabled, setMovePlayersEnabled] = useState(false);
  const [drawArrowsEnabled, setDrawArrowsEnabled] = useState(false);
  const [freePositions, setFreePositions] = useState({}); // index -> { xPercent, yPercent }
  const [arrows, setArrows] = useState([]); // { x1, y1, x2, y2 }
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);

  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState("");
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [isOpeningAnalysis, setIsOpeningAnalysis] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(null);

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
    if (!isAuthenticated()) {
      // redirect to login if not authenticated
      navigate("/login");
      return;
    }

    authFetch(`/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data.teams))
      .catch((err) => console.error("TEAMS API ERROR:", err));
  }, []);

  const loadAnalyses = async () => {
    if (!isAuthenticated()) return;
    setIsLoadingAnalyses(true);
    try {
      const res = await authFetch(`/analysis`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSavedAnalyses(data.analyses || []);
    } catch (err) {
      console.error("Load analyses failed:", err);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  // Load saved analyses for the logged-in user
  useEffect(() => {
    loadAnalyses();
  }, []);

  // Load players for selected team
  useEffect(() => {
    if (!selectedTeam) return;

    if (!isAuthenticated()) return;
    authFetch(`/players/${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || []);
        setAllPlayers(data.players || []);
        setAssigned({});
        setSubs({ right: [] });
        setTeamRating(0);
        setMovePlayersEnabled(false);
        setDrawArrowsEnabled(false);
        setFreePositions({});
        setArrows([]);
      })
      .catch((err) => console.error("PLAYERS API ERROR:", err));
  }, [selectedTeam]);

  // Load team logo for selected team
  useEffect(() => {
    if (!selectedTeam) {
      setLogo("");
      return;
    }
    if (!isAuthenticated()) return;

    authFetch(`/logo/${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => setLogo(data.logo || ""))
      .catch((err) => console.error("LOGO API ERROR:", err));
  }, [selectedTeam]);

  // Formation point generator
  const formationPoints = useMemo(
    () => getFormationCoordinates(formation) || [],
    [formation]
  );

  // Convert formation points for horizontal pitch (rotate 90° clockwise visually)
  // mapping: x' = original y, y' = 100 - original x
  const horizontalFormationPoints = useMemo(
    () =>
      formationPoints.map((p) => ({
        ...p,
        xPercent: p.yPercent,
        yPercent: 100 - p.xPercent,
      })),
    [formationPoints]
  );

  // Formation changes should clear free-move offsets (new point layout)
  useEffect(() => {
    if (pendingAnalysis) return;
    setFreePositions({});
  }, [horizontalFormationPoints]);

  // Apply a pending loaded analysis after team/players/formation are ready
  useEffect(() => {
    if (!pendingAnalysis) return;

    const targetTeam = pendingAnalysis.team;
    const targetFormation = pendingAnalysis.formation;

    if (targetTeam && targetTeam !== selectedTeam) return;
    if (targetFormation && targetFormation !== formation) return;
    if (!allPlayers?.length) return;

    const nextAssigned = pendingAnalysis.assigned || {};
    setAssigned(nextAssigned);
    setSubs(pendingAnalysis.subs || { right: [] });
    setFreePositions(pendingAnalysis.freePositions || {});
    setArrows(pendingAnalysis.arrows || []);

    const { team } = buildTeamFromAssigned(nextAssigned, allPlayers, formationRoles);
    setTeamRating(getTeamRatings(team).average);

    setPendingAnalysis(null);
  }, [pendingAnalysis, selectedTeam, formation, allPlayers, formationRoles]);

  // const handleDrop = useMemo(
  //   () =>
  //     createHandleDrop({
  //       formationPoints,
  //       setAssigned,
  //       setPlayers,
  //       playerList: [...allPlayers, ...players],
  //       formationRoles,
  //       setTeamRating,
  //     }),
  //   [formationPoints, setAssigned, setPlayers, players, allPlayers, formationRoles]
  // );

  const handleDrop = useMemo(
  () =>
    createHandleDrop({
      formationPoints: horizontalFormationPoints,
      setAssigned,
      setPlayers,
      setSubs,
      side: "right",
      flipY: false,
      playerList: allPlayers,
      formationRoles,
      setTeamRating,
    }),
  [
    horizontalFormationPoints,
    setAssigned,
    setPlayers,
    players,
    allPlayers,
    formationRoles,
    setSubs,
    setTeamRating,
  ]
);

  const handleRemovePlayer = (playerName, index) => {
    setAssigned((prev) => {
      const updated = { ...prev };
      delete updated[index];

      const { team } = buildTeamFromAssigned(updated, allPlayers, formationRoles);
      setTeamRating(getTeamRatings(team).average);
      return updated;
    });

    setFreePositions((prev) => {
      if (!prev[index]) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });

    const playerObj = allPlayers.find((p) => p.name === playerName);
    if (playerObj) {
      setSubs((prev) => {
        const list = prev.right || [];
        if (list.some((p) => p?.name === playerObj.name)) return prev;
        return { ...prev, right: [...list, playerObj] };
      });
    }
  };


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
      const res = await authFetch(`/predict`, {
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

  const handleSaveAnalysis = async () => {
    if (!selectedTeam) return;

    const name = (window.prompt("Name this analysis") || "").trim();
    if (!name) return;

    setIsSavingAnalysis(true);
    try {
      const res = await authFetch(`/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          team: selectedTeam,
          formation,
          assigned,
          subs,
          freePositions,
          arrows,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save analysis");
      }

      window.alert("Analysis saved");
      await loadAnalyses();
    } catch (err) {
      console.error("Save analysis failed:", err);
      window.alert("Failed to save analysis");
    } finally {
      setIsSavingAnalysis(false);
    }
  };

  const handleOpenAnalysis = async () => {
    if (!selectedAnalysisId) return;
    setIsOpeningAnalysis(true);
    try {
      const res = await authFetch(`/analysis/${selectedAnalysisId}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Stage application; team/formation changes may trigger resets.
      setPendingAnalysis(data);

      if (data.team && data.team !== selectedTeam) {
        setSelectedTeam(data.team);
      }
      if (data.formation && data.formation !== formation) {
        setFormation(data.formation);
      }
    } catch (err) {
      console.error("Open analysis failed:", err);
      window.alert("Failed to open analysis");
    } finally {
      setIsOpeningAnalysis(false);
    }
  };

  return (
    <div className="team-builder-container">
      <LineupControls
        teams={teams}
        formations={formations}
        logo={logo}
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
{/* 
      <button className="analyze-btn" onClick={handleAnalyze}>
        Analyze Result
      </button>

      {prediction && (
        <h2 className="prediction-text">Predicted Result: {prediction}</h2>
      )} */}

      {selectedTeam && (
        <div className="builder-layout">
          <PlayerList players={players} />

          <div className="pitch-and-tools">
            <div className="analysis-tools">
              <label className="analysis-tool">
                <input
                  type="checkbox"
                  checked={movePlayersEnabled}
                  onChange={(e) => setMovePlayersEnabled(e.target.checked)}
                />
                Move players
              </label>
              <label className="analysis-tool">
                <input
                  type="checkbox"
                  checked={drawArrowsEnabled}
                  onChange={(e) => setDrawArrowsEnabled(e.target.checked)}
                />
                Draw arrows
              </label>

              <button
                type="button"
                className="analysis-reset"
                onClick={() => {
                  setMovePlayersEnabled(false);
                  setDrawArrowsEnabled(false);
                  setFreePositions({});
                  setArrows([]);
                }}
              >
                Reset
              </button>

              <button
                type="button"
                className="analysis-reset"
                disabled={isSavingAnalysis}
                onClick={handleSaveAnalysis}
              >
                {isSavingAnalysis ? "Saving..." : "Save analysis"}
              </button>

              <select
                className="analysis-select"
                value={selectedAnalysisId}
                onChange={(e) => setSelectedAnalysisId(e.target.value)}
                disabled={isLoadingAnalyses}
              >
                <option value="">Open saved…</option>
                {savedAnalyses.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {(a.name || "(unnamed)") + (a.team ? ` — ${a.team}` : "")}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="analysis-reset"
                disabled={!selectedAnalysisId || isOpeningAnalysis}
                onClick={handleOpenAnalysis}
              >
                {isOpeningAnalysis ? "Opening..." : "Open"}
              </button>

              <button
                type="button"
                className="analysis-reset"
                disabled={isLoadingAnalyses || (savedAnalyses || []).length === 0}
                onClick={() => navigate("/compare")}
              >
                Compare
              </button>
            </div>

          <Pitch
            pitchRef={pitchRef}
            formationPoints={horizontalFormationPoints}
            assigned={assigned}
            players={players}
            allPlayers={allPlayers}
            onDrop={handleDrop}
            onRemovePlayer={handleRemovePlayer}
            movePlayersEnabled={movePlayersEnabled}
            drawArrowsEnabled={drawArrowsEnabled}
            freePositions={freePositions}
            setFreePositions={setFreePositions}
            arrows={arrows}
            setArrows={setArrows}
          />

          </div>

          <div className="subs-panel">
            <h3 className="subs-title">Subs</h3>
            <div className="subs-list">
              {subs.right.map((player, i) => (
                <div
                  key={`${player.name}-${i}`}
                  className="sub-item"
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", JSON.stringify(player))
                  }
                >
                  <span className="sub-icon">🔄</span>
                  <div className="sub-dot">{player.position?.[0]}</div>
                  <div className="sub-name">{player.name.replace("_", " ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
