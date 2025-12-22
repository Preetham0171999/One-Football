import { useState } from "react";
import { login, signup } from "../utils/api";
import { saveToken } from "../utils/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      saveToken(res.access_token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleSignup, loading, error };
}
