// src/pages/VitalsTracker.jsx
import React, { useState, useEffect } from "react";
import "../styles/VitalsTracker.css";

const STORAGE_KEY = "healtrack_vitals";

const EMPTY_FORM = { bp: "", sugar: "", pulse: "", temperature: "", date: "" };

function getBadge(type, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  if (type === "pulse")  return v < 60 || v > 100 ? (v < 50 || v > 110 ? "danger" : "warning") : "normal";
  if (type === "sugar")  return v > 200 ? "danger" : v > 140 ? "warning" : "normal";
  if (type === "temperature") return v > 38.5 ? "danger" : v > 37.5 ? "warning" : "normal";
  // bp is "120/80" style
  const sys = parseInt(value?.split("/")?.[0]);
  if (isNaN(sys)) return null;
  return sys > 140 ? "danger" : sys > 130 ? "warning" : "normal";
}

const CHART_METRICS = [
  { key: "pulse", label: "🫀 Pulse", cls: "pulse", unit: "bpm", max: 150 },
  { key: "sugar", label: "🩸 Sugar", cls: "sugar", unit: "mg/dL", max: 300 },
  { key: "temperature", label: "🌡️ Temp", cls: "temp", unit: "°C", max: 41 },
];

export default function VitalsTracker() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  const [form, setForm] = useState({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 16) });
  const [activeMetric, setActiveMetric] = useState("pulse");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.date) return;
    const entry = { ...form, id: Date.now() };
    setEntries(prev => [entry, ...prev].slice(0, 30)); // keep last 30
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 16) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const deleteEntry = id => setEntries(prev => prev.filter(e => e.id !== id));

  // Compute latest stats
  const latest = entries[0] || {};
  const stats = [
    { icon: "🩸", label: "Blood Pressure", value: latest.bp || "—", unit: "", type: "bp" },
    { icon: "💉", label: "Blood Sugar", value: latest.sugar || "—", unit: "mg/dL", type: "sugar" },
    { icon: "🫀", label: "Pulse", value: latest.pulse || "—", unit: "bpm", type: "pulse" },
    { icon: "🌡️", label: "Temperature", value: latest.temperature || "—", unit: "°C", type: "temperature" },
  ];

  // Build chart data
  const chartData = [...entries].reverse().slice(-10);
  const metric = CHART_METRICS.find(m => m.key === activeMetric);

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } catch { return iso; }
  };

  return (
    <div className="vitals-wrapper">
      <div className="vitals-header">
        <h1>📊 Health Vitals Tracker</h1>
        <p>Log your daily vitals and track trends over time</p>
      </div>

      <div className="vitals-content">

        {/* Stat Cards */}
        <div className="vitals-stats">
          {stats.map(s => {
            const badge = s.value !== "—" ? getBadge(s.type, s.value) : null;
            return (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className={`stat-value ${badge || ""}`}>{s.value}</div>
                <div className="stat-label">{s.label}{s.unit ? ` (${s.unit})` : ""}</div>
                {badge && badge !== "normal" && (
                  <span className={`badge ${badge}`} style={{ marginTop: 6 }}>
                    {badge === "danger" ? "⚠️ High" : "Elevated"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Vitals Form */}
        <div className="vitals-form-card">
          <h2>➕ Add Today's Vitals</h2>
          <form onSubmit={handleSubmit}>
            <div className="vitals-grid">
              <div className="vitals-field">
                <label>Blood Pressure (sys/dia)</label>
                <input name="bp" placeholder="e.g. 120/80" value={form.bp} onChange={handleChange} />
              </div>
              <div className="vitals-field">
                <label>Blood Sugar (mg/dL)</label>
                <input type="number" name="sugar" placeholder="e.g. 95" value={form.sugar} onChange={handleChange} min="0" max="600" />
              </div>
              <div className="vitals-field">
                <label>Pulse (bpm)</label>
                <input type="number" name="pulse" placeholder="e.g. 72" value={form.pulse} onChange={handleChange} min="20" max="250" />
              </div>
              <div className="vitals-field">
                <label>Temperature (°C)</label>
                <input type="number" step="0.1" name="temperature" placeholder="e.g. 36.6" value={form.temperature} onChange={handleChange} min="30" max="45" />
              </div>
              <div className="vitals-field">
                <label>Date &amp; Time</label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="vitals-submit">
              💾 Save Entry
            </button>
            {saved && (
              <span style={{ marginLeft: 14, color: "#43e97b", fontSize: "0.9rem" }}>
                ✅ Saved!
              </span>
            )}
          </form>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="chart-card">
            <h2>📈 Trend Chart</h2>
            <div className="chart-tabs">
              {CHART_METRICS.map(m => (
                <button
                  key={m.key}
                  className={`chart-tab ${activeMetric === m.key ? "active" : ""}`}
                  onClick={() => setActiveMetric(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="chart-area">
              {chartData.map((entry, i) => {
                const val = parseFloat(entry[metric.key]);
                const pct = isNaN(val) ? 0 : Math.min((val / metric.max) * 100, 100);
                return (
                  <div key={i} className="chart-bar-wrap">
                    <div
                      className={`chart-bar ${metric.cls}`}
                      style={{ height: `${pct}%` }}
                      title={`${val} ${metric.unit}`}
                    />
                    <span className="chart-label">{fmtDate(entry.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="vitals-table-card">
          <h2>📋 History (last 30 entries)</h2>
          {entries.length === 0 ? (
            <p className="vitals-empty">No vitals logged yet. Add your first entry above!</p>
          ) : (
            <table className="vitals-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>BP</th>
                  <th>Sugar</th>
                  <th>Pulse</th>
                  <th>Temp (°C)</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const badge = getBadge("pulse", e.pulse) || getBadge("sugar", e.sugar) || getBadge("temperature", e.temperature) || "normal";
                  return (
                    <tr key={e.id}>
                      <td>{fmtDate(e.date)}</td>
                      <td>{e.bp || "—"}</td>
                      <td>{e.sugar || "—"}</td>
                      <td>{e.pulse || "—"}</td>
                      <td>{e.temperature || "—"}</td>
                      <td>
                        <span className={`badge ${badge}`}>
                          {badge === "normal" ? "✅ Normal" : badge === "warning" ? "⚠️ Elevated" : "🔴 High"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteEntry(e.id)}
                          style={{ background: "none", border: "none", color: "#e96c6c", cursor: "pointer", fontSize: "1rem" }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
