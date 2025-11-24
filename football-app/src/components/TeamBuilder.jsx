import React, { useState, useMemo, useEffect } from "react";
import "./TeamBuilder.css";

export default function TeamBuilder() {

  // -------------------------------
  // API STATE MANAGEMENT
  // -------------------------------
// ----------------------------------------------------
// STATE MANAGEMENT
// ----------------------------------------------------
const [teams, setTeams] = useState([]);
const [selectedTeam, setSelectedTeam] = useState("");
const [players, setPlayers] = useState([]);        // available players
const [logo, setLogo] = useState("");
const [metrics, setMetrics] = useState([]);
const [history, setHistory] = useState([]);
const [teamInfo, setTeamInfo] = useState({});
const [showMoreInfo, setShowMoreInfo] = useState(false);
const [team, setTeam] = useState({});

const [allPlayers, setAllPlayers] = useState([]); // hidden lookup list


const [averageRating, setAverageRating] = useState(0);

// NON-API STATE
const [formation, setFormation] = useState("4-3-3");
const [assigned, setAssigned] = useState({});      // { index: playerName }


// ----------------------------------------------------
// FORMATION PRESETS
// ----------------------------------------------------
const formations = {
  "4-3-3": { defense: 4, midfield: 3, attack: 3 },
  "4-4-2": { defense: 4, midfield: 4, attack: 2 },
  "3-5-2": { defense: 3, midfield: 5, attack: 2 },
  "4-2-3-1": { defense: 4, midfield: 2, attack: 3 },
};

// Rating modifier based on natural vs assigned position
// const getAdjustedRating = (player, assignedPos) => {
//   if (!player || !assignedPos) return 0;

//   const natural = player.position.toLowerCase();
//   const assigned = assignedPos.toLowerCase();

//   // Same position → full rating
//   if (natural === assigned) return player.rating;

//   // Different position → reduced rating
//   return player.rating * 0.8;
// };


const getAdjustedRating = (player, assignedPos) => {
  console.log(
    "%c[CHECK] Calculating rating...",
    "color: orange; font-weight: bold;"
  );
  console.log("Player:", player);
  console.log("Assigned Position:", assignedPos);

  if (!player || !player.position || !player.rating) {
    console.warn("[WARN] Missing player data:", player);
    return 0;
  }

  const actual = player.position.toLowerCase();
  const assigned = assignedPos.toLowerCase();
  let adjusted = player.rating;

  // defender playing midfield or attack
  if (actual === "defense" && assigned !== "defense") {
    adjusted *= 0.8;
  }

  // midfield playing defense or attack
  if (actual === "midfield" && assigned !== "midfield") {
    adjusted *= 0.8;
  }

  // attack playing defense or midfield
  if (actual === "attack" && assigned !== "attack") {
    adjusted *= 0.8;
  }

  console.log(
    `%cAdjusted Rating: ${adjusted}`,
    "color: lightgreen; font-weight:bold;"
  );

  return adjusted;
};


const TeamBuilder = () => {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [team, setTeam] = useState({});
  const [averageRating, setAverageRating] = useState(0);

  const formations = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "4-2-3-1": { defense: 4, midfield: 2, attack: 3 },
  };

  useEffect(() => {
    if (team && Object.keys(team).length > 0) {
      let total = 0;
      let count = 0;

      Object.entries(team).forEach(([assignedPos, players]) => {
        players.forEach((player) => {
          total += getAdjustedRating(player, assignedPos);
          count++;
        });
      });

      setAverageRating(count > 0 ? (total / count).toFixed(2) : 0);
    }
  }, [team]);

  return (
    <div className="team-builder">
      <div className="rating-box">
        <h3>Team Overall Rating: ⭐ {averageRating}</h3>
      </div>

      {/* Rest of your JSX... */}
    </div>
  );
};

function generatePlayerPositions(count, yPercent) {
  const gap = 100 / (count + 1);
  return Array.from({ length: count }, (_, i) => ({
    xPercent: (i + 1) * gap,
    yPercent,
  }));
}

function getFormationCoordinates(f) {
  const layout = formations[f];
  return [
    ...generatePlayerPositions(layout.defense, 70),
    ...generatePlayerPositions(layout.midfield, 50),
    ...generatePlayerPositions(layout.attack, 30),
    { xPercent: 50, yPercent: 90 } // GK
  ];
}

const formationPoints = getFormationCoordinates(formation);


// ----------------------------------------------------
// TEAM RATING CALCULATION
// ----------------------------------------------------
// useEffect(() => {
//   if (team && Object.keys(team).length > 0) {
//     let total = 0;
//     let count = 0;

//     Object.entries(team).forEach(([assignedPos, players]) => {
//       players.forEach((player) => {
//         total += getAdjustedRating(player, assignedPos);
//         count++;
//       });
//     });

//     setAverageRating(count > 0 ? (total / count).toFixed(2) : 0);
//   }
// }, [team]);

//waste debugging

// TEAM RATING CALCULATION
// ----------------------------------------------------
useEffect(() => {
  console.log("🔥 useEffect triggered! Current team:", team);

  if (!team || Object.keys(team).length === 0) {
    console.log("⛔ Team empty or undefined");
    return;
  }

  let total = 0;
  let count = 0;

  Object.entries(team).forEach(([assignedPos, players]) => {
    console.log(`➡️ Checking assigned position: ${assignedPos}`, players);

    players.forEach((player) => {
      console.log("   🎯 Player inside team:", player);

      const adjusted = getAdjustedRating(player, assignedPos);
      console.log(
        `   ⭐ Adjusted rating for ${player.name} (actual: ${player.position}, assigned: ${assignedPos}) = ${adjusted}`
      );

      total += adjusted;
      count++;
    });
  });

  console.log("📊 Total Rating:", total, "Players Count:", count);

  const avg = count > 0 ? (total / count).toFixed(2) : 0;

  console.log("✅ FINAL AVERAGE RATING:", avg);

  setAverageRating(avg);
}, [team]);





// ----------------------------------------------------
// API CALLS
// ----------------------------------------------------

// Fetch all teams on mount
useEffect(() => {
  fetch("http://localhost:8000/teams")
    .then(res => res.json())
    .then(data => setTeams(data.teams))
    .catch(err => console.error("TEAM LOAD ERROR:", err));
}, []);

// When selecting a team → load team info
useEffect(() => {
  if (!selectedTeam) return;

  fetch(`http://localhost:8000/team-info/${selectedTeam}`)
    .then(res => res.json())
    .then(data => setTeamInfo(data))
    .catch(err => console.error("TEAM INFO ERROR:", err));
}, [selectedTeam]);

// Load logo, players, metrics, history
useEffect(() => {
  if (!selectedTeam) return;

  const loadTeamData = async () => {
    try {
      const p = await fetch(`http://localhost:8000/players/${selectedTeam}`);
      const pData = await p.json();
      setPlayers(pData.players);
      setAllPlayers(pData.players);

      const m = await fetch(`http://localhost:8000/club-metrics/${selectedTeam}`);
      const mData = await m.json();
      setMetrics(mData.metrics);

      const h = await fetch(`http://localhost:8000/club-history/${selectedTeam}`);
      const hData = await h.json();
      setHistory(hData.history);

      const l = await fetch(`http://localhost:8000/logo/${selectedTeam}`);
      const lData = await l.json();
      setLogo(lData.logo);

      // Reset assigned positions when changing teams
      setAssigned({});

    } catch (err) {
      console.error("API LOAD ERROR:", err);
    }
  };

  loadTeamData();
}, [selectedTeam]);


// ----------------------------------------------------
// DRAG + DROP
// ----------------------------------------------------
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

  // Assign player to pitch
  setAssigned(prev => ({
    ...prev,
    [closestIndex]: player.name
  }));

  // Remove from list
  setPlayers(prev => prev.filter(p => p.name !== player.name));
}








  // -------------------------------
  // RENDER
  // -------------------------------
return (

  
  <div className="team-builder-container">
    <div className="rating-box">
  <h3>Team Overall Rating: ⭐{averageRating}</h3>
</div>


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

    {/* FORMATION SELECTOR */}
<div className="formation-box">
  <label>Select Formation:</label>
  <select
    value={formation}
    onChange={(e) => setFormation(e.target.value)}
  >
    {Object.keys(formations).map((f) => (
      <option key={f} value={f}>{f}</option>
    ))}
  </select>
</div>


    {/* TEAM LOGO */}
    {selectedTeam && (
      <img className="team-logo-right" src={logo} alt={selectedTeam} />
    )}

    {/* TEAM INFO PANEL */}
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

    {/* MAIN LAYOUT → PLAYER LIST + PITCH */}
    <div className="builder-layout">

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
      <div
        className="pitch-container"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Pitch lines */}
        <div className="penalty-box top"></div>
        <div className="center-line"></div>
        <div className="center-circle"></div>
        <div className="penalty-box bottom"></div>

        {/* Formation markers */}
        {formationPoints.map((p, index) => {
  const playerName = assigned[index];
  const playerObj = players.concat(allPlayers).find(pl => pl.name === playerName);

  return (
    <div
      key={index}
      className="player-dot-wrapper"
      style={{
        left: p.xPercent + "%",
        top: p.yPercent + "%",
      }}
    >
      {/* Floating player card */}
      {playerObj && (
        <div className="player-info-card">
          <strong>{playerObj.name}</strong><br />
          {playerObj.position} — ⭐{playerObj.rating}
        </div>
      )}

      {/* The dot */}
      <div
        className="player-dot"
        style={{
          background: playerObj ? "#ffd700" : "#ffffff88",
        }}
      />
    </div>
  );
})}

      </div>

    </div> {/* END builder-layout */}

  </div> // END team-builder-container
);

}








