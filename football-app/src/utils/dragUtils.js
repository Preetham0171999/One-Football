// utils/dragUtils.js
import { buildTeamFromAssigned, getTeamRatings } from "./ratingUtils";

export function handleDragStart(e, player) {
  e.dataTransfer.setData("player", JSON.stringify(player));
}

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

    const player = JSON.parse(e.dataTransfer.getData("player"));
    const pitch = e.currentTarget;
    const rect = pitch.getBoundingClientRect();

    const dropX = ((e.clientX - rect.left) / rect.width) * 100;
    const dropY = ((e.clientY - rect.top) / rect.height) * 100;

    // find closest slot
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

    // assign
    setAssigned(prev => {
      const updated = { ...prev, [closestIndex]: player.name };

      // ⭐ Build team object based on assigned + roles
      const { team } = buildTeamFromAssigned(updated, playerList, formationRoles);

      // ⭐ Calculate FINAL rating with role-based logic
      const { average } = getTeamRatings(team);

      setTeamRating(average);

      return updated;
    });

    // remove from available list
    setPlayers(prev => prev.filter(p => p.name !== player.name));
  };
}
