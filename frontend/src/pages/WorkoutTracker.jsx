import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiActivity } from "react-icons/fi";

const EXERCISES = [
  "Squats","Push-ups","Pull-ups","Deadlifts","Bench Press",
  "Lunges","Plank","Bicep Curls","Shoulder Press","Rows",
  "Leg Press","Cable Fly","Tricep Dips","Running","Cycling",
  "Jump Rope","Burpees","Mountain Climbers","Sit-ups","Dumbbell Row",
];

const CAL_RATES = {
  Running: 10, Cycling: 8, "Jump Rope": 12, Burpees: 11,
  "Mountain Climbers": 9, default: 5,
};

export default function WorkoutTracker() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    exercise: "Squats", reps: 10, sets: 3,
    duration_minutes: 30, calories_burned: "", notes: "",
  });

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = () => {
    api.get("/workout/history").then(r => setLogs(r.data)).catch(() => {});
  };

  const handle = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    // Auto-calculate calories if not manually set
    if (["exercise", "duration_minutes", "sets"].includes(name) && !form._cal_manual) {
      const rate = CAL_RATES[updated.exercise] || CAL_RATES.default;
      updated.calories_burned = Math.round(rate * Number(updated.duration_minutes));
    }
    if (name === "calories_burned") updated._cal_manual = true;
    setForm(updated);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/workout/log", {
        exercise: form.exercise,
        reps: Number(form.reps),
        sets: Number(form.sets),
        duration_minutes: Number(form.duration_minutes),
        calories_burned: Number(form.calories_burned),
        notes: form.notes,
      });
      toast.success("Workout logged! 🔥");
      fetchLogs();
      setForm({ exercise: "Squats", reps: 10, sets: 3, duration_minutes: 30, calories_burned: "", notes: "" });
    } catch {
      toast.error("Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id) => {
    await api.delete(`/workout/log/${id}`);
    setLogs(l => l.filter(x => x._id !== id));
    toast.success("Deleted");
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2.2rem", letterSpacing: 1, marginBottom: 6 }}>Workout Tracker</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Log your sets, reps, and track your progress</p>

      {/* Log form */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 style={{ marginBottom: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <FiPlus size={16} color="var(--accent)" /> Log a Workout
        </h3>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>Exercise</label>
              <select name="exercise" value={form.exercise} onChange={handle}>
                {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
            {[["Reps", "reps", "number"], ["Sets", "sets", "number"], ["Duration (min)", "duration_minutes", "number"], ["Calories", "calories_burned", "number"]].map(([label, name, type]) => (
              <div key={name}>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>{label}</label>
                <input name={name} type={type} value={form[name]} onChange={handle} min="0" required={name !== "notes"} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>Notes</label>
              <input name="notes" value={form.notes} onChange={handle} placeholder="Optional…" />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8 }} disabled={loading}>
            <FiActivity size={14} />
            {loading ? "Logging…" : "Log Workout"}
          </button>
        </form>
      </div>

      {/* History */}
      <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Recent Workouts</h3>
      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
          <FiActivity size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No workouts logged yet. Start tracking!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {logs.map(log => (
            <div key={log._id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0,229,160,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FiActivity size={18} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>{log.exercise}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                  {log.sets} sets × {log.reps} reps · {log.duration_minutes} min · {log.calories_burned} kcal
                  {log.notes && ` · "${log.notes}"`}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  {new Date(log.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <button onClick={() => deleteLog(log._id)} style={{ background: "none", color: "var(--muted)", padding: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
