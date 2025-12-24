import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/auth.css";

export default function Signup() {
  const { handleSignup, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await handleSignup(form);
    if (ok) alert("Signup successful. Go login 🏃‍♂️");
  };

 return (
  <div className="auth-page bg-panel">
    <div className="auth-card">
      <form onSubmit={submit}>
        <h2>Sign Up</h2>

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="auth-switch" disabled={loading}>Sign Up</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>

    <div className="auth-footer">
      <p className="auth-note">Already have an account? Login</p>
      <button
        type="button"
        className="auth-switch btn-primary"
        onClick={() => (window.location.href = "/login")}
      >
        Login
      </button>
    </div>
  </div>
);

}
