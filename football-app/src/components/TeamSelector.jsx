import React, { useState, useEffect } from "react";
 




export default function TeamSelector() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [logo, setLogo] = useState("");



  useEffect(() => {
    fetch("http://localhost:8000/teams")
      .then(res => res.json())
      .then(data => setTeams(data.teams));
  }, []);




useEffect(() => {
  if (!selectedTeam) return;

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`http://localhost:8000/players/${selectedTeam}`);
      const data = await res.json();
      setPlayers(data.players); // now players is array of {name, rating}
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  fetchPlayers();
}, [selectedTeam]);


useEffect(() => {
  if (!selectedTeam) return;

  fetch(`http://localhost:8000/logo/${selectedTeam}`)
    .then(res => res.json())
    .then(data => setLogo(data.logo));
}, [selectedTeam]);










  return (
    
    <div className="selector-container">

       <div className="player-header">
    <span style={{ flex: 1 }}>Name</span>
    <span style={{ flex: 1 }}>Position</span>
    <span style={{ flex: 1, textAlign: "right" }}>Rating</span>
  </div>

      
      <h2>Select your football team ⚽</h2>
      <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}
         className="team-dropdown">
        <option value="">-- Select Team --</option>
        {teams.map((team, idx) => (
          <option key={idx} value={team}>
            {team}
          </option>
        ))}
      </select>

      {selectedTeam && (
  <div className="team-info">
    <div className="team-left">
      <h3>You selected: {selectedTeam}</h3>

      <ul className="player-list">
          {players.map(player => (
  <li>
    {/* {player.name} — {player.position} — Rating {player.rating} */}

    <span className="player-name">{p.name}</span>
        <span className="player-position">{p.position}</span>
        <span className="player-rating">{p.rating}</span>
  </li>
))
}
      </ul>
    </div>

    <div className="team-logo-box">
      <img
        src={logo}
        alt={selectedTeam}
        className="team-logo"
      />
    </div>
  </div>
)}

    </div>
  );
}
