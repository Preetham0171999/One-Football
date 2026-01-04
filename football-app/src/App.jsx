import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import BackButton from "./components/BackButton";
import TeamSelector from "./components/TeamSelector";
import TeamBuilder from "./components/TeamBuilder";
import BuildMatch from "./components/BuildMatch/BuildMatch";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ChangePassword from "./pages/auth/ChangePassword";
import Dashboard from "./pages/Dashboard";
import CompareAnalyses from "./pages/CompareAnalyses";
import News from "./pages/News";
import AboutUs from "./pages/AboutUs";
import Apis from "./pages/Apis";
import Leagues from "./pages/Leagues";
import { Navigate } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <div className="floating-back-container">
        <BackButton />
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leagues"
          element={
            <ProtectedRoute>
              <Leagues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apis"
          element={
            <ProtectedRoute>
              <Apis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about-us"
          element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <CompareAnalyses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
