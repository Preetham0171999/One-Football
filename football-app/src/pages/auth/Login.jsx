import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/auth.css";

export default function Login() {
  const { handleLogin, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await handleLogin(form);
    if (ok) window.location.href = "/dashboard";
  };

 return (
  <div className="auth-page bg-panel">
    <div className="auth-card">
      <form onSubmit={submit}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn-primary" disabled={loading}>Login</button>

        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>

      <div className="auth-footer">
      <p className="auth-note">Don't have an account? Sign up first</p>
      <button
        type="button"
        className="auth-switch btn-primary"
        onClick={() => (window.location.href = "/signup")}
      >
        Sign Up
      </button>
    </div>
  </div>
);

}
