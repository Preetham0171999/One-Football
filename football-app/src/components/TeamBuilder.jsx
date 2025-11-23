import React, { useState, useMemo, useEffect } from "react";
import "./TeamBuilder.css";

export default function TeamBuilder() {

  // -------------------------------
  // API STATE MANAGEMENT
  // -------------------------------
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [logo, setLogo] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [history, setHistory] = useState([]);
  const [teamInfo, setTeamInfo] = useState({});
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // -------------------------------
  // NON-API STATE
  // -------------------------------
  const [formation, setFormation] = useState("4-3-3");
  const [assigned, setAssigned] = useState({});

  // -------------------------------
  // FORMATION SYSTEM
  // -------------------------------
  const formations = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "4-2-3-1": { defense: 4, midfield: 2, attack: 3 },
  };

  function generatePlayerPositions(count, yPercent) {
    const gap = 100 / (count + 1);
    return Array.from({ length: count }, (_, i) => ({
      xPercent: (i + 1) * gap,
      yPercent
    }));
  }

  function getFormationCoordinates(formation) {
    const f = formations[formation];
    return [
      ...generatePlayerPositions(f.defense, 70),
      ...generatePlayerPositions(f.midfield, 50),
      ...generatePlayerPositions(f.attack, 30),
      { xPercent: 50, yPercent: 90 } // GK
    ];
  }

  const formationPoints = useMemo(
    () => getFormationCoordinates(formation),
    [formation]
  );

  // -------------------------------
  // API CALLS
  // -------------------------------

  // Load list of all teams
  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then(res => res.json())
      .then(data => setTeams(data.teams));
  }, []);

  // When team selected: load info
  useEffect(() => {
    if (!selectedTeam) return;

    fetch(`http://localhost:8000/team-info/${selectedTeam}`)
      .then(res => res.json())
      .then(data => setTeamInfo(data));
  }, [selectedTeam]);

  // Load logo, players, metrics, history
  useEffect(() => {
    if (!selectedTeam) return;

    const loadTeamData = async () => {
      try {
        // Players
        const p = await fetch(`http://localhost:8000/players/${selectedTeam}`);
        const pData = await p.json();
        setPlayers(pData.players);

        // Metrics
        const m = await fetch(`http://localhost:8000/club-metrics/${selectedTeam}`);
        const mData = await m.json();
        setMetrics(mData.metrics);

        // History
        const h = await fetch(`http://localhost:8000/club-history/${selectedTeam}`);
        const hData = await h.json();
        setHistory(hData.history);

        // Logo
        const l = await fetch(`http://localhost:8000/logo/${selectedTeam}`);
        const lData = await l.json();
        setLogo(lData.logo);

      } catch (err) {
        console.error("API error:", err);
      }
    };
    loadTeamData();
  }, [selectedTeam]);

  // -------------------------------
  // DRAG + DROP
  // -------------------------------
  function handleDragStart(e, player) {
    e.dataTransfer.setData("player", JSON.stringify(player));
  }

  function handleDrop(e) {
    e.preventDefault();
    const player = JSON.parse(e.dataTransfer.getData("player"));

    const pitch = document.querySelector(".pitch-container");
    const rect = pitch.getBoundingClientRect();

    const dropX = ((e.clientX - rect.left) / rect.width) * 100;
    const dropY = ((e.clientY - rect.top) / rect.height) * 100;

    let closestIndex = null;
    let smallestDist = Infinity;

    formationPoints.forEach((p, index) => {
      const dx = p.xPercent - dropX;
      const dy = p.yPercent - dropY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < smallestDist) {
        smallestDist = dist;
        closestIndex = index;
      }
    });

    setAssigned(prev => ({
      ...prev,
      [closestIndex]: player.name
    }));
  }

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="team-builder-container">

      {/* TEAM DROPDOWN */}
      <div className="selector-container">
        <h2>Select Your Football Team ⚽</h2>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="team-dropdown"
        >
          <option value="">-- Select Team --</option>
          {teams.map((team, idx) => (
            <option key={idx} value={team}>{team}</option>
          ))}
        </select>
      </div>

      {/* SHOW LOGO */}
      {selectedTeam && (
        <img className="team-logo-right" src={logo} alt={selectedTeam} />
      )}

      {/* TEAM INFO EXPANDABLE PANEL */}
      {selectedTeam && (
        <div className="more-info-box">
          <button 
            className="more-info-btn"
            onClick={() => setShowMoreInfo(!showMoreInfo)}
          >
            {showMoreInfo ? "Hide Info" : "Show Info"}
          </button>

          {showMoreInfo && (
            <div className="more-info-content">
              <h3>About {selectedTeam}</h3>
              <p>{teamInfo.description}</p>

              <h4>Fun Facts</h4>
              <ul>
                {teamInfo.fun_facts?.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* PLAYER LIST */}
      
      <div className="player-list-box">
        {players.map((player, idx) => (
          <div
            key={idx}
            draggable
            className="draggable-player"
            onDragStart={(e) => handleDragStart(e, player)}
          >
            {player.name} ({player.position}) ⭐{player.rating}
          </div>
        ))}
      </div>

      {/* FOOTBALL PITCH */}
      {/* FOOTBALL PITCH */}
<div
  className="pitch-container"
  onDragOver={(e) => e.preventDefault()}
  onDrop={handleDrop}
>
  {/* Pitch design */}
  <div className="penalty-box top"></div>
  <div className="center-line"></div>
  <div className="center-circle"></div>
  <div className="penalty-box bottom"></div>

  {/* Formation player dots */}
  {formationPoints.map((p, index) => (
    <div
      key={index}
      className="player-dot"
      style={{
        left: p.xPercent + "%",
        top: p.yPercent + "%",
        background: assigned[index] ? "#ffd700" : "#ffffff88",
      }}
    >
      {/* Show ONLY first letter if assigned */}
      {assigned[index] ? assigned[index][0] : ""}
    </div>
  ))}
</div>


      

    </div>
  );
}








