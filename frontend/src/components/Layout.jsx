import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid, FiCoffee, FiActivity, FiCamera,
  FiTrendingUp, FiLogOut, FiMenu, FiX, FiZap
} from "react-icons/fi";

const NAV = [
  { to: "/dashboard", icon: FiGrid,       label: "Dashboard" },
  { to: "/diet",      icon: FiCoffee,     label: "Diet Plan" },
  { to: "/workout",   icon: FiActivity,   label: "Workout" },
  { to: "/pose",      icon: FiCamera,     label: "AI Trainer" },
  { to: "/progress",  icon: FiTrendingUp, label: "Progress" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: open ? 220 : 68,
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiZap size={18} color="#000" />
          </div>
          {open && <span style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem", letterSpacing: 1, whiteSpace: "nowrap", color: "var(--accent)" }}>AI GYM</span>}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          style={{ background: "none", color: "var(--muted)", padding: "12px 16px", textAlign: "left", display: "flex", alignItems: "center" }}
        >
          {open ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>

        {/* Nav links */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 16px",
                color: isActive ? "var(--accent)" : "var(--muted)",
                background: isActive ? "rgba(0,229,160,0.08)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              })}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {open && <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px" }}>
          {open && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", color: "var(--danger)", padding: "8px 0", width: "100%" }}
          >
            <FiLogOut size={18} />
            {open && <span style={{ fontSize: "0.9rem" }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: open ? 220 : 68,
        flex: 1,
        transition: "margin-left 0.25s ease",
        padding: "32px",
        minHeight: "100vh",
      }}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
