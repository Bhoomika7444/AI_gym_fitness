import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiZap } from "react-icons/fi";
import toast from "react-hot-toast";

const GOALS = [
  { value: "weight_loss", label: "🔥 Weight Loss" },
  { value: "muscle_gain", label: "💪 Muscle Gain" },
  { value: "maintenance", label: "⚖️ Maintenance" },
];

// OUTSIDE component — prevents input losing focus on every keystroke
function Field({ label, name, type, placeholder, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 6, display: "block" }}>{label}</label>
      <input name={name} type={type || "text"} value={value} onChange={onChange} required placeholder={placeholder} autoComplete="off" />
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", height: "", weight: "", goal: "maintenance" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });
      toast.success("Account created! Let's get fit 💪");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "40px 20px", backgroundImage: "radial-gradient(circle at 80% 80%, rgba(0,229,160,0.05) 0%, transparent 50%)" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: "var(--accent)", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <FiZap size={22} color="#000" />
          </div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "1.9rem", letterSpacing: 2 }}>Join AI GYM</h1>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={submit}>
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Full Name"  name="name"     value={form.name}     onChange={handle} placeholder="Alex Johnson" />
              <Field label="Email"      name="email"    value={form.email}    onChange={handle} type="email"    placeholder="alex@example.com" />
              <Field label="Password"   name="password" value={form.password} onChange={handle} type="password" placeholder="Min 8 characters" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Age"         name="age"    value={form.age}    onChange={handle} type="number" placeholder="25" />
                <Field label="Height (cm)" name="height" value={form.height} onChange={handle} type="number" placeholder="175" />
                <Field label="Weight (kg)" name="weight" value={form.weight} onChange={handle} type="number" placeholder="70" />
              </div>
              <div>
                <label style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 6, display: "block" }}>Fitness Goal</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {GOALS.map(g => (
                    <button type="button" key={g.value} onClick={() => setForm(prev => ({ ...prev, goal: g.value }))}
                      style={{ padding: "10px 8px", borderRadius: 8, fontSize: "0.82rem", border: `1px solid ${form.goal === g.value ? "var(--accent)" : "var(--border)"}`, background: form.goal === g.value ? "rgba(0,229,160,0.1)" : "var(--bg3)", color: form.goal === g.value ? "var(--accent)" : "var(--muted)", fontWeight: 500, transition: "all 0.15s" }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: 13, marginTop: 20 }} disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 18, color: "var(--muted)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
