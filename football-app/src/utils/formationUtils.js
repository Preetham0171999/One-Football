// src/utils/formationUtils.js

export const formationMap = {
  "4-3-3": [4, 3, 3],
  "4-4-2": [4, 4, 2],
  "3-5-2": [3, 5, 2],
  "4-2-3-1": [4, 2, 3, 1],
};

// Generate coordinates (PERCENT based!)
export function getFormationCoordinates(formation) {
  const structure = formationMap[formation];
  if (!structure) return [];

  const points = [];
  const totalLines = structure.length;

  // Generate all field players (lines from top to bottom)
  structure.forEach((count, lineIndex) => {
    const y = ((lineIndex + 1) / (totalLines + 1)) * 100; // vertical %
    const gap = 100 / (count + 1); // horizontal spacing

    for (let i = 0; i < count; i++) {
      points.push({
        xPercent: (i + 1) * gap,
        yPercent: y,
      });
    }
  });

  // Add goalkeeper at the top (opposite side) so it does not interfere with formation lines
  points.unshift({
    xPercent: 50,   // center horizontally
    yPercent: 5,    // near top
    role: "goalkeeper" // optional
  });

  return points;
}

export const formationRoles = {
  "4-3-3": [
    "goalkeeper",
    "left-back", "left-center-back", "right-center-back", "right-back",
    "left-mid", "center-mid", "right-mid",
    "left-wing", "striker", "right-wing"
  ],
  "4-4-2": [
    "goalkeeper",
    "left-back", "left-center-back", "right-center-back", "right-back",
    "left-mid", "left-center-mid", "right-center-mid", "right-mid",
    "striker-1", "striker-2"
  ],
  "3-5-2": [
    "goalkeeper",
    "left-center-back", "center-back", "right-center-back",
    "left-mid", "left-center-mid", "center-mid", "right-center-mid", "right-mid",
    "striker-1", "striker-2"
  ],
  "4-2-3-1": [
    "goalkeeper",
    "left-back", "left-center-back", "right-center-back", "right-back",
    "cdm-1", "cdm-2",
    "cam-left", "cam", "cam-right",
    "striker"
  ]
};

