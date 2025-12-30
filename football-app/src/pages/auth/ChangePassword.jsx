import React, { useState } from "react";
import { authFetch } from "../../utils/api";
import "../../styles/auth.css";

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.oldPassword || !form.newPassword || !form.confirmNewPassword) {
      setError("Please fill all fields");
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setError("New password and retype password are not same");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: form.oldPassword,
          new_password: form.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.detail || "Failed to change password");
        return;
      }

      setSuccess("Password updated successfully");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bg-panel">
      <div className="auth-card">
        <form onSubmit={submit}>
          <h2>Change Password</h2>

          <input
            type="password"
            placeholder="Old Password"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />

          <input
            type="password"
            placeholder="Retype New Password"
            value={form.confirmNewPassword}
            onChange={(e) =>
              setForm({ ...form, confirmNewPassword: e.target.value })
            }
          />

          <button className="btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

          {error && <p className="auth-error">{error}</p>}
          {success && <p style={{ marginTop: 12, color: "#2e7d32", textAlign: "center" }}>{success}</p>}

        </form>
      </div>
    </div>
  );
}
