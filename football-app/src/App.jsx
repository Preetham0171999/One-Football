import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TeamSelector from "./components/TeamSelector";
import TeamBuilder from "./components/TeamBuilder";
import BuildMatch from "./components/BuildMatch/BuildMatch"

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        <Route path="/" element={<TeamSelector />} />
        <Route path="/build-team" element={<TeamBuilder />} />
        <Route path="/build-match" element={<BuildMatch />} />

      </Routes>
    </BrowserRouter>
  );
}
