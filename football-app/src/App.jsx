import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TeamSelector from "./components/TeamSelector";
import TeamBuilder from "./components/TeamBuilder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeamSelector />} />
        <Route path="/build-team" element={<TeamBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}
