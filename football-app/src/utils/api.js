export const BASE_URL = "http://127.0.0.1:8000";

import { getToken, logout } from "./auth";

export async function signup(data) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// Wrapper that attaches Authorization header and redirects on 401
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  options.headers = headers;

  const res = await fetch(url.startsWith("http") ? url : `${BASE_URL}${url}`, options);
  if (res.status === 401) {
    try {
      logout();
    } catch (e) {}
    // Force redirect to login
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res;
}

export async function chat(message) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
