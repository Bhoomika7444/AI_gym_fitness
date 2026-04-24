import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiZap, FiMail, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 💪");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
      backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0,229,160,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,184,255,0.06) 0%, transparent 50%)",
    }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: "var(--accent)", borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <FiZap size={26} color="#000" />
          </div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2.2rem", letterSpacing: 2, color: "var(--text)" }}>AI GYM</h1>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>Your intelligent fitness companion</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 24, fontSize: "1.3rem", fontWeight: 700 }}>Welcome back</h2>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <FiMail size={13} /> Email
              </label>
              <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <FiLock size={13} /> Password
              </label>
              <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 8, width: "100%", padding: "13px" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
