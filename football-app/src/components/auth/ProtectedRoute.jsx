import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "8px 16px",
        background: "#0b243b",
        color: "#fff"
      }}>
        <button onClick={handleLogout} style={{
          background: "#ff4d4f",
          border: "none",
          color: "white",
          padding: "8px 12px",
          borderRadius: 4,
          cursor: "pointer"
        }}>Logout</button>
      </header>
      {children}
    </>
  );
}
