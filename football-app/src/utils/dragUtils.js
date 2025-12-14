// utils/dragUtils.js
import { buildTeamFromAssigned, getTeamRatings } from "./ratingUtils";

/* ---------------- DRAG START ---------------- */

export function handleDragStart(e, player) {
  e.dataTransfer.setData("text/plain", JSON.stringify(player));
}

/* ---------------- DROP HANDLER FACTORY ---------------- */

/**
 * Creates a drop handler for a team side (left / right)
 * All state updates flow UP via setters
 */
export function createHandleDrop({
  formationPoints,
  setAssigned,
  setPlayers,
  setSubs,
  side,
  playerList,
  formationRoles,
  setTeamRating,
}) {
  return function handleDrop(e, player) {
    // ⛔ safety guard
    if (!e?.currentTarget || !player) return;

    /* ---------- FIND DROP POSITION ---------- */
    const rect = e.currentTarget.getBoundingClientRect();
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

    if (closestIndex === null) return;

    /* ---------- ASSIGN / SWAP LOGIC ---------- */
    setAssigned(prev => {
      const updated = { ...prev };
      const existingPlayerName = prev[closestIndex];

      // 🟡 Slot occupied → move old player to subs
      if (existingPlayerName) {
        const existingPlayer = playerList.find(
          p => p.name === existingPlayerName
        );

        if (existingPlayer) {
          setSubs(prevSubs => ({
            ...prevSubs,
            [side]: [...prevSubs[side], existingPlayer],
          }));
        }
      }

      // 🟢 Place new player
      updated[closestIndex] = player.name;

      // 🔢 Recalculate rating
      const { team } = buildTeamFromAssigned(
        updated,
        playerList,
        formationRoles
      );

      setTeamRating(getTeamRatings(team).average);

      return updated;
    });

    /* ---------- REMOVE INCOMING PLAYER FROM LIST ---------- */
    setPlayers(prev =>
      prev.filter(p => p.name !== player.name)
    );

    /* ---------- REMOVE INCOMING PLAYER FROM SUBS (if any) ---------- */
    setSubs(prevSubs => ({
      ...prevSubs,
      [side]: prevSubs[side].filter(p => p.name !== player.name),
    }));
  };
}
