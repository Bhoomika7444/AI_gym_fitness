import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";

const PREFS = ["non-vegetarian", "vegetarian", "vegan"];
const GOALS = ["weight_loss", "muscle_gain", "maintenance"];

const MacroBar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{value}g</span>
    </div>
    <div style={{ background: "var(--bg3)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
    </div>
  </div>
);

export default function DietPlan() {
  const { user } = useAuth();
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    height: user?.height || "",
    weight: user?.weight || "",
    age:    user?.age    || "",
    goal:   user?.goal   || "maintenance",
    dietary_preference: "non-vegetarian",
  });

  useEffect(() => {
    api.get("/diet/my-plan").then(r => setPlan(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/diet/plan", {
        ...form,
        height: Number(form.height),
        weight: Number(form.weight),
        age:    Number(form.age),
      });
      setPlan(res.data);
      toast.success("Diet plan generated! 🥗");
    } catch {
      toast.error("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const bmiColor = plan?.bmi < 18.5 ? "#00b8ff" : plan?.bmi < 25 ? "#00e5a0" : plan?.bmi < 30 ? "#ffa502" : "#ff4757";

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2.2rem", letterSpacing: 1, marginBottom: 6 }}>Diet Plan</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Personalized nutrition based on your goals</p>

      {/* Config card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Customize Your Plan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
          {[["Height (cm)", "height"], ["Weight (kg)", "weight"], ["Age", "age"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>{label}</label>
              <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>Goal</label>
            <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
              {GOALS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>Diet Type</label>
            <select value={form.dietary_preference} onChange={e => setForm({ ...form, dietary_preference: e.target.value })}>
              {PREFS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button onClick={generate} className="btn-primary" style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8 }} disabled={loading}>
          <FiRefreshCw size={14} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          {loading ? "Generating…" : "Generate Plan"}
        </button>
      </div>

      {plan && (
        <>
          {/* BMI + Macros */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>BMI Analysis</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-head)", fontSize: "3rem", color: bmiColor }}>{plan.bmi}</p>
                  <span className="tag" style={{ background: `${bmiColor}18`, color: bmiColor }}>{plan.bmi_category}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                    Daily target: <strong style={{ color: "var(--accent)", fontSize: "1.1rem" }}>{plan.daily_calories}</strong> kcal
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Based on TDEE × goal multiplier</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Macro Targets</h3>
              <MacroBar label="Protein" value={plan.protein_g} max={250} color="#00e5a0" />
              <MacroBar label="Carbohydrates" value={plan.carbs_g} max={400} color="#00b8ff" />
              <MacroBar label="Fats" value={plan.fat_g} max={150} color="#ffa502" />
            </div>
          </div>

          {/* Meal cards */}
          <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Your Meal Plan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
            {plan.meals?.map((meal, i) => {
              const labels = ["🌅 Breakfast", "☀️ Lunch", "🍎 Snack", "🌙 Dinner"];
              const colors = ["#ffa502", "#00e5a0", "#ff6b9d", "#00b8ff"];
              return (
                <div key={i} className="card" style={{ borderTop: `3px solid ${colors[i]}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700 }}>{labels[i]} — {meal.name}</span>
                    <span style={{ color: colors[i], fontWeight: 700, fontSize: "0.88rem" }}>{meal.calories} kcal</span>
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    {meal.items.map((item, j) => (
                      <li key={j} style={{ color: "var(--muted)", fontSize: "0.83rem", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors[i], flexShrink: 0, display: "inline-block" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    {[["P", meal.protein, "#00e5a0"], ["C", meal.carbs, "#00b8ff"], ["F", meal.fat, "#ffa502"]].map(([lbl, val, clr]) => (
                      <span key={lbl} style={{ fontSize: "0.75rem", color: clr }}>
                        <strong>{lbl}</strong> {val}g
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="card">
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>💡 Nutrition Tips</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plan.tips?.map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>→</span>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
