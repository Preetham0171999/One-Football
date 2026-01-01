import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function AppHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-nav">
          <button
            type="button"
            className="app-header-title"
            onClick={() => navigate("/dashboard")}
          >
            Home
          </button>

          <button
            type="button"
            className="app-header-title"
            onClick={() => navigate("/news")}
          >
            News
          </button>

          <button
            type="button"
            className="app-header-title"
            onClick={() => navigate("/about-us")}
          >
            About Us
          </button>

          <button
            type="button"
            className="app-header-title"
            onClick={() => navigate("/apis")}
          >
            APIs
          </button>
        </div>

        <div className="app-header-right" ref={menuRef}>
          <button
            type="button"
            className="profile-button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Profile
            <span className="profile-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {open && (
            <div className="profile-dropdown" role="menu">
              <button
                type="button"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate("/change-password");
                }}
              >
                Change Password
              </button>

              <button
                type="button"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
