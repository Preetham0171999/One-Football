// src/utils/dragUtils.js

export function handleDragStart(e, player) {
  e.dataTransfer.setData("player", JSON.stringify(player));
}


export function createHandleDrop({ formationPoints, setAssigned, setPlayers }) {
  // return a drop handler that knows these values
  return function handleDrop(e) {
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

    // Assign player
    setAssigned(prev => ({
      ...prev,
      [closestIndex]: player.name
    }));

    // Remove from list
    setPlayers(prev => prev.filter(p => p.name !== player.name));
  };
}
