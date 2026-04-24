import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from "recharts";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

export default function Progress() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [form, setForm]       = useState({ weight: "", notes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/progress/history").then(r => {
      setEntries(r.data);
      if (r.data.length >= 2) {
        const first = r.data[0].weight;
        const last  = r.data[r.data.length - 1].weight;
        const diff  = last - first;
        setStats({ first, last, diff: diff.toFixed(1), trend: diff < 0 ? "down" : diff > 0 ? "up" : "flat" });
      }
    }).catch(() => {});
    api.get("/workout/stats").then(r => setStats(s => ({ ...s, ...r.data.summary }))).catch(() => {});
  }, []);

  const logProgress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/progress/log", { weight: Number(form.weight), notes: form.notes });
      toast.success("Progress logged! 📈");
      const r = await api.get("/progress/history");
      setEntries(r.data);
      setForm({ weight: "", notes: "" });
    } catch {
      toast.error("Failed to log progress");
    } finally {
      setLoading(false);
    }
  };

  const chartData = entries.map(e => ({
    date: new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    weight: e.weight,
  }));

  const weightChange = entries.length >= 2
    ? (entries[entries.length - 1].weight - entries[0].weight).toFixed(1)
    : null;

  const TrendIcon = weightChange < 0 ? FiTrendingDown : weightChange > 0 ? FiTrendingUp : FiMinus;
  const trendColor = weightChange < 0 ? (user?.goal === "weight_loss" ? "#00e5a0" : "#ff4757")
                   : weightChange > 0 ? (user?.goal === "muscle_gain" ? "#00e5a0" : "#ffa502")
                   : "#6b7280";

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2.2rem", letterSpacing: 1, marginBottom: 6 }}>Progress</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Track your weight and fitness journey over time</p>

      {/* Log weight */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Log Today's Weight</h3>
        <form onSubmit={logProgress} style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>Weight (kg)</label>
            <input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} required placeholder="e.g. 72.5" />
          </div>
          <div style={{ flex: "2 1 200px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Post-workout, morning weigh-in…" />
          </div>
          <button type="submit" className="btn-primary" style={{ flex: "0 0 auto", padding: "11px 24px" }} disabled={loading}>
            {loading ? "Saving…" : "Log Weight"}
          </button>
        </form>
      </div>

      {/* Stats row */}
      {entries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Starting Weight", value: `${entries[0].weight} kg`, color: "#6b7280" },
            { label: "Current Weight",  value: `${entries[entries.length - 1].weight} kg`, color: "var(--accent)" },
            { label: "Total Change",    value: weightChange !== null ? `${weightChange > 0 ? "+" : ""}${weightChange} kg` : "—", color: trendColor },
            { label: "Entries Logged",  value: entries.length, color: "#00b8ff" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center", padding: "18px" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-head)", fontSize: "1.7rem", color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Weight Over Time</h3>
            {weightChange !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: trendColor, fontWeight: 700 }}>
                <TrendIcon size={16} />
                <span style={{ fontSize: "0.9rem" }}>{weightChange > 0 ? "+" : ""}{weightChange} kg total</span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5a0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                labelStyle={{ color: "var(--muted)" }}
                itemStyle={{ color: "var(--accent)" }}
                formatter={v => [`${v} kg`, "Weight"]}
              />
              {user?.weight && <ReferenceLine y={user.weight} stroke="var(--muted)" strokeDasharray="4 4" label={{ value: "Start", fill: "var(--muted)", fontSize: 11 }} />}
              <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} fill="url(#wGrad)" dot={{ fill: "var(--accent)", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : entries.length === 1 ? (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)", marginBottom: 24 }}>
          <p>Log at least 2 entries to see your progress chart.</p>
        </div>
      ) : null}

      {/* History table */}
      {entries.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...entries].reverse().slice(0, 20).map((e, i) => (
              <div key={e._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 19 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{e.weight} kg</p>
                  {e.notes && <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{e.notes}</p>}
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                  {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
          <FiTrendingUp size={44} style={{ marginBottom: 14, opacity: 0.25 }} />
          <p style={{ fontWeight: 600 }}>No progress logged yet</p>
          <p style={{ fontSize: "0.88rem", marginTop: 6 }}>Start by logging your current weight above.</p>
        </div>
      )}
    </div>
  );
}
