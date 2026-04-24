import React, { useState, useEffect, useRef } from "react";
import { FiCamera, FiRefreshCw, FiPlay, FiSquare, FiInfo } from "react-icons/fi";

const POSE_URL = process.env.REACT_APP_POSE_URL || "http://localhost:5050";

const EXERCISES = [
  { id: "squat",      label: "Squats",      desc: "Stand with feet shoulder-width apart. Face the camera from the side." },
  { id: "pushup",     label: "Push-Ups",    desc: "Face the camera from the side in a plank position." },
  { id: "bicep_curl", label: "Bicep Curls", desc: "Stand facing the camera, hold weights at sides." },
];

export default function PoseDetector() {
  const [active, setActive]       = useState(false);
  const [exercise, setExercise]   = useState("squat");
  const [stats, setStats]         = useState(null);
  const [serverUp, setServerUp]   = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    // Check if pose server is running
    fetch(`${POSE_URL}/stats`)
      .then(r => r.json())
      .then(() => setServerUp(true))
      .catch(() => setServerUp(false));
  }, []);

  const startSession = async () => {
    try {
      await fetch(`${POSE_URL}/set_exercise/${exercise}`);
      await fetch(`${POSE_URL}/reset`);
      setActive(true);
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${POSE_URL}/stats`);
          const d = await r.json();
          setStats(d);
        } catch { /* server might be busy */ }
      }, 500);
    } catch {
      alert("Could not connect to AI Trainer. Make sure pose_detector.py is running on port 5050.");
    }
  };

  const stopSession = () => {
    setActive(false);
    clearInterval(pollRef.current);
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  const switchExercise = async (ex) => {
    setExercise(ex);
    if (active) {
      await fetch(`${POSE_URL}/set_exercise/${ex}`);
      await fetch(`${POSE_URL}/reset`);
      setStats(null);
    }
  };

  const resetCount = async () => {
    await fetch(`${POSE_URL}/reset`);
    setStats(null);
  };

  const selectedEx = EXERCISES.find(e => e.id === exercise);

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2.2rem", letterSpacing: 1, marginBottom: 6 }}>AI Gym Trainer</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Real-time pose detection, rep counting, and form feedback</p>

      {/* Server status */}
      {serverUp === false && (
        <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <FiInfo size={18} color="var(--danger)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>AI Trainer Server Not Running</p>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
              The pose detection module requires a separate Python server. Start it with:<br />
              <code style={{ background: "var(--bg3)", padding: "3px 8px", borderRadius: 5, color: "var(--accent)" }}>
                cd ai_modules && pip install -r requirements.txt && python pose_detector.py
              </code>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20 }}>
        {/* Video feed */}
        <div>
          <div style={{ position: "relative", background: "var(--bg3)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "4/3" }}>
            {active ? (
              <img
                src={`${POSE_URL}/video_feed`}
                alt="Live pose detection"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,229,160,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCamera size={32} color="var(--accent)" />
                </div>
                <p style={{ color: "var(--muted)", fontWeight: 500 }}>Camera inactive</p>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Select an exercise and press Start</p>
              </div>
            )}

            {/* Overlay stats */}
            {active && stats && (
              <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(10,11,15,0.85)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Reps</p>
                <p style={{ fontFamily: "var(--font-head)", fontSize: "2.5rem", color: "var(--accent)", lineHeight: 1 }}>{stats.count || 0}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{stats.stage || "—"}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
            {!active ? (
              <button className="btn-primary" onClick={startSession} disabled={serverUp === false}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiPlay size={14} /> Start Session
              </button>
            ) : (
              <button onClick={stopSession} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger)", color: "#fff", padding: "11px 24px", borderRadius: 8, fontWeight: 600 }}>
                <FiSquare size={14} /> Stop
              </button>
            )}
            <button className="btn-secondary" onClick={resetCount} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FiRefreshCw size={13} /> Reset Count
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Exercise selector */}
          <div className="card">
            <h3 style={{ marginBottom: 14, fontWeight: 700, fontSize: "0.95rem" }}>Exercise</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXERCISES.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => switchExercise(ex.id)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, textAlign: "left",
                    border: `1px solid ${exercise === ex.id ? "var(--accent)" : "var(--border)"}`,
                    background: exercise === ex.id ? "rgba(0,229,160,0.08)" : "transparent",
                    color: exercise === ex.id ? "var(--accent)" : "var(--muted)",
                    fontWeight: exercise === ex.id ? 700 : 400,
                    fontSize: "0.88rem", transition: "all 0.15s",
                  }}
                >{ex.label}</button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700, fontSize: "0.95rem" }}>Live Feedback</h3>
            {active && stats?.feedback ? (
              <p style={{ color: "var(--accent)", fontSize: "0.88rem", lineHeight: 1.6, fontWeight: 500 }}>{stats.feedback}</p>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Feedback will appear here once the session starts.</p>
            )}

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Setup Tip</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>{selectedEx?.desc}</p>
            </div>
          </div>

          {/* How it works */}
          <div className="card">
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>How It Works</p>
            {["MediaPipe detects 33 body landmarks", "Angles calculated between joints", "Rep counted on full range of motion", "Form feedback given in real time"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
