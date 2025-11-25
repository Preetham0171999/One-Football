import React, { useState, useMemo, useEffect } from "react";
import { handleDragStart, createHandleDrop } from "../utils/dragUtils";
import Pitch from "./Pitch";




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

const formationRoles = getFormationCoordinates(formation).map((p, idx) => {
  if (idx < formations[formation].defense) return "defense";
  if (idx < formations[formation].defense + formations[formation].midfield) return "midfield";
  if (idx < formations[formation].defense + formations[formation].midfield + formations[formation].attack) 
    return "attack";
  return "goalkeeper";
});



function normalizePosition(pos) {
  if (!pos) return "";

  pos = pos.toLowerCase();

  if (pos.includes("defender")) return "defense";
  if (pos.includes("midfielder")) return "midfield";
  if (pos.includes("forward") || pos.includes("striker")) return "attack";
  if (pos.includes("goalkeeper") || pos.includes("keeper")) return "goalkeeper";

  return pos;
}



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
  const actual = normalizePosition(player.position);
  const assigned = assignedPos.toLowerCase();

  let adjusted = player.rating;

  if (actual !== assigned && assigned !== "goalkeeper") {
    adjusted *= 0.8;
  }

  return adjusted;
};

const TeamBuilder = () => {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [team, setTeam] = useState({});
  const [averageRating, setAverageRating] = useState(0);



    // 👇 THIS is what "inside component" means


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

  const handleDrop = createHandleDrop({
    formationPoints,
    setAssigned,
    setPlayers
  });





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
    players.forEach((player) => {
      total += getAdjustedRating(player, assignedPos);
      count++;
    });
  });

  setAverageRating(count > 0 ? (total / count).toFixed(2) : 0);
}, [team]);


useEffect(() => {
  const newTeam = { defense: [], midfield: [], attack: [], goalkeeper: [] };

  Object.entries(assigned).forEach(([slotIndex, playerName]) => {
    const role = formationRoles[slotIndex];
    const playerObj = [...players, ...allPlayers].find(p => p.name === playerName);

    if (playerObj) newTeam[role].push(playerObj);
  });

  setTeam(newTeam);
}, [assigned, formation]);







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
  className="draggable-player"
  draggable
  onDragStart={(e) => handleDragStart(e, player)}
>
  {player.name} ({player.position}) ⭐{player.rating}
</div>

        ))}
      </div>
<Pitch
  formationPoints={formationPoints}
  assigned={assigned}
  players={players}
  allPlayers={allPlayers}
  handleDrop={handleDrop}
/>

      

    </div> {/* END builder-layout */}

  </div> // END team-builder-container
);

}








