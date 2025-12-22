import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Signup() {
  const { handleSignup, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await handleSignup(form);
    if (ok) alert("Signup successful. Go login 🏃‍♂️");
  };

 return (
  <div className="auth-page">
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

        <button disabled={loading}>Sign Up</button>

        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  </div>
);

}
