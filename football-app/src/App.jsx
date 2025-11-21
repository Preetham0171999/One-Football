import React from "react";
import TeamSelector from "./components/TeamSelector";

function ErrorBoundary({ children }) {
  return (
    <React.StrictMode>
      {children}
    </React.StrictMode>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TeamSelector />
    </ErrorBoundary>
  );
}
