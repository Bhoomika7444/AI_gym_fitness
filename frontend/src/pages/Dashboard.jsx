import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  FiActivity, FiCoffee, FiCamera, FiTrendingUp,
  FiSend, FiZap, FiDroplet, FiCpu
} from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const QUICK_LINKS = [
  { to: "/workout", icon: FiActivity, label: "Log Workout", color: "#00e5a0" },
  { to: "/diet",    icon: FiCoffee,   label: "Diet Plan",   color: "#00b8ff" },
  { to: "/pose",    icon: FiCamera,   label: "AI Trainer",  color: "#ffa502" },
  { to: "/progress",icon: FiTrendingUp,label:"Progress",    color: "#ff6b9d" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [chat, setChat]     = useState([
    { role: "ai", text: `Hey ${user?.name?.split(" ")[0] || "champion"}! 💪 I'm your AI fitness coach. Ask me anything about workouts, diet, or motivation!` }
  ]);
  const [msg, setMsg]       = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    api.get("/workout/stats").then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setMsg("");
    setChat(c => [...c, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await api.post("/chat/", { message: userMsg });
      setChat(c => [...c, { role: "ai", text: res.data.reply }]);
    } catch {
      setChat(c => [...c, { role: "ai", text: "Sorry, I'm having trouble connecting. Try again!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const bmiColor = user?.bmi < 18.5 ? "#00b8ff" : user?.bmi < 25 ? "#00e5a0" : user?.bmi < 30 ? "#ffa502" : "#ff4757";

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2.4rem", letterSpacing: 1 }}>
          Good day, {user?.name?.split(" ")[0]}!
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>Here's your fitness overview</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "BMI", value: user?.bmi || "—", icon: FiZap, color: bmiColor, sub: user?.bmi < 18.5 ? "Underweight" : user?.bmi < 25 ? "Normal" : user?.bmi < 30 ? "Overweight" : "Obese" },
          { label: "Workouts (30d)", value: stats?.summary?.total_workouts ?? "—", icon: FiActivity, color: "#00e5a0", sub: "sessions" },
          { label: "Calories Burned", value: stats?.summary?.total_calories ?? "—", icon: FiDroplet, color: "#ff6b9d", sub: "last 30 days" },
          { label: "Active Minutes", value: stats?.summary?.total_minutes ?? "—", icon: FiCpu, color: "#00b8ff", sub: "last 30 days" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ fontSize: "2rem", fontFamily: "var(--font-head)", letterSpacing: 1, marginTop: 4, color: s.color }}>{s.value}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{s.sub}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {QUICK_LINKS.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}>
            <div className="card" style={{
              textAlign: "center", padding: "22px 16px", cursor: "pointer",
              transition: "border-color 0.2s, transform 0.15s",
              borderColor: "var(--border)",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Chatbot */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Weekly chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: "1rem", fontWeight: 700 }}>Weekly Calories Burned</h3>
          {stats?.weekly?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.weekly} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="_id" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  labelStyle={{ color: "var(--muted)" }}
                  itemStyle={{ color: "var(--accent)" }}
                />
                <Bar dataKey="calories" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--muted)", textAlign: "center" }}>No workouts yet.<br />
                <Link to="/workout" style={{ color: "var(--accent)", fontWeight: 600 }}>Log your first one →</Link>
              </p>
            </div>
          )}
        </div>

        {/* Chatbot */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: 280, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "rgba(0,229,160,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiZap size={15} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>AI Fitness Coach</p>
              <p style={{ color: "var(--accent)", fontSize: "0.72rem" }}>● Online</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chat.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "8px 12px", borderRadius: 10, fontSize: "0.83rem", lineHeight: 1.5,
                  background: m.role === "user" ? "var(--accent)" : "var(--bg3)",
                  color: m.role === "user" ? "#000" : "var(--text)",
                  fontWeight: m.role === "user" ? 600 : 400,
                }}>{m.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", gap: 4, padding: "6px 12px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--muted)", animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          <form onSubmit={sendMsg} style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Ask your fitness coach…"
              style={{ flex: 1, fontSize: "0.83rem", padding: "8px 12px" }}
            />
            <button type="submit" className="btn-primary" style={{ padding: "8px 14px", display: "flex", alignItems: "center" }}>
              <FiSend size={14} />
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}
