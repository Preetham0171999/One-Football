// utils/dragUtils.js
import { buildTeamFromAssigned, getTeamRatings } from "./ratingUtils";

export function handleDragStart(e, player) {
  console.log("DragStart:", player);
  e.dataTransfer.setData("player", JSON.stringify(player));
}

/**
 * Creates a drop handler for a team side (left/right)
 * All state is managed via parent setters
 */
export function createHandleDrop({
  formationPoints,
  setAssigned,
  setPlayers,
  playerList,
  formationRoles,
  setTeamRating
}) {
  return function handleDrop(e) {
    e.preventDefault();

    const rawData = e.dataTransfer.getData("player");
    if (!rawData) {
      console.warn("No data received on drop!");
      return;
    }

    const player = JSON.parse(rawData);
    console.log("Dropped player:", player);

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = ((e.clientX - rect.left) / rect.width) * 100;
    const dropY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find closest formation slot
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

    if (closestIndex === null) {
      console.warn("No suitable slot found for drop");
      return;
    }

    // Update assigned players and calculate team rating
    setAssigned(prev => {
      const updatedAssigned = { ...prev, [closestIndex]: player.name };

      const { team } = buildTeamFromAssigned(
        updatedAssigned,
        playerList,
        formationRoles
      );

      const { average } = getTeamRatings(team);
      setTeamRating(average);

      return updatedAssigned;
    });

    // Remove from available players
    setPlayers(prev => {
      const updatedPlayers = prev.filter(p => p.name !== player.name);
      console.log("Updated available players:", updatedPlayers);
      return updatedPlayers;
    });
  };
}
