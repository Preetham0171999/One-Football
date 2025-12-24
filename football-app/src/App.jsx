import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TeamSelector from "./components/TeamSelector";
import TeamBuilder from "./components/TeamBuilder";
import BuildMatch from "./components/BuildMatch/BuildMatch";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import { Navigate } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamSelector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/build-team"
          element={
            <ProtectedRoute>
              <TeamBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/build-match"
          element={
            <ProtectedRoute>
              <BuildMatch />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
