// src/pages/HealthDashboard.jsx — Patient Health Dashboard (unified portal)
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import "../styles/HealthDashboard.css";

const VITALS_KEY   = "healtrack_vitals";
const REMINDER_KEY = "healtrack_reminders";

function getBadge(type, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  if (type === "pulse")       return v < 60 || v > 100 ? (v < 50 || v > 110 ? "danger" : "warning") : "normal";
  if (type === "sugar")       return v > 200 ? "danger" : v > 140 ? "warning" : "normal";
  if (type === "temperature") return v > 38.5 ? "danger" : v > 37.5 ? "warning" : "normal";
  const sys = parseInt(value?.split("/")?.[0]);
  if (isNaN(sys)) return null;
  return sys > 140 ? "danger" : sys > 130 ? "warning" : "normal";
}

function getOverallStatus(vitals) {
  if (!vitals) return "normal";
  const badges = [
    getBadge("bp", vitals.bp),
    getBadge("pulse", vitals.pulse),
    getBadge("sugar", vitals.sugar),
    getBadge("temperature", vitals.temperature),
  ].filter(Boolean);
  if (badges.includes("danger"))  return "danger";
  if (badges.includes("warning")) return "warning";
  return "normal";
}

export default function HealthDashboard() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  // Vitals from localStorage
  const [latestVitals, setLatestVitals] = useState(null);
  // Reminders
  const [reminders, setReminders] = useState([]);
  // Prescriptions
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx]         = useState(false);
  // Tip of the day
  const [tipIdx, setTipIdx] = useState(0);

  const TIPS = [
    "💧 Drink at least 8 glasses of water daily to stay hydrated.",
    "🚶 A 30-minute walk daily can reduce the risk of heart disease by 35%.",
    "🛌 7–9 hours of sleep per night boosts immunity and mental health.",
    "🥦 Eat 5 servings of fruits & vegetables daily for optimal nutrition.",
    "🧘 Practice deep breathing for 5 minutes to reduce stress hormones.",
    "🩸 Check your blood pressure regularly — high BP has no symptoms.",
    "💊 Never skip prescribed medication; consistency is key to recovery.",
    "🚭 Quitting smoking improves lung function within just 2 weeks.",
    "🏋️ Strength training twice a week improves bone density significantly.",
    "😊 Positive thinking can reduce cortisol levels and boost immunity.",
  ];

  useEffect(() => {
    // Load vitals
    try {
      const stored = JSON.parse(localStorage.getItem(VITALS_KEY)) || [];
      setLatestVitals(stored[0] || null);
    } catch { /* empty */ }

    // Load reminders
    try {
      const stored = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
      setReminders(stored);
    } catch { /* empty */ }

    // Rotate daily tip
    setTipIdx(new Date().getDate() % TIPS.length);
  }, []);

  // Load prescriptions for patient
  useEffect(() => {
    if (!user?.name) return;
    setLoadingRx(true);
    api.get(`/prescriptions/patient?name=${encodeURIComponent(user.name)}`)
      .then(res => setPrescriptions(res.data?.slice(0, 3) || []))
      .catch(() => {})
      .finally(() => setLoadingRx(false));
  }, [user]);

  const status = getOverallStatus(latestVitals);
  const statusLabel = { normal: "✅ All Vitals Normal", warning: "⚠️ Elevated Readings", danger: "🔴 Critical — Consult Doctor" };
  const statusCls   = { normal: "status-ok", warning: "status-warn", danger: "status-danger" };

  const todayReminders = reminders.filter(r => {
    const now  = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    return r.time >= hhmm;
  }).slice(0, 3);

  const quickLinks = [
    { icon: "📊", label: "Vitals Tracker",     path: "/vitals",   color: "#6c63ff" },
    { icon: "💊", label: "Medicine Reminder",  path: "/reminder", color: "#f7971e" },
    { icon: "📂", label: "Medical Records",    path: "/records",  color: "#43e97b" },
    { icon: "🔖", label: "Check Appointment",  path: "/status",   color: "#56ccf2" },
    { icon: "⭐", label: "Rate a Doctor",      path: "/review",   color: "#ffd200" },
    { icon: "🏥", label: "Nearby Hospitals",   path: "/nearby",   color: "#e96c6c" },
    { icon: "🤖", label: "AI Health Chat",     path: "/chatbot",  color: "#a29bfe" },
    { icon: "🚨", label: "Emergency",          path: "/emergency",color: "#ff6b6b" },
  ];

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); }
    catch { return ""; }
  };

  return (
    <div className="hd-wrapper">
      <div className="hd-content">
      {/* Header */}
      <div className="hd-header">
        <div>
          <h1>🏥 Health Dashboard</h1>
          <p>Welcome back, <strong>{user?.name || "Patient"}</strong> — here's your health summary</p>
        </div>
        <div className={`hd-status-badge ${statusCls[status]}`}>
          {statusLabel[status]}
        </div>
      </div>

      {/* Tip of the Day */}
      <div className="hd-tip">
        <span className="tip-label">💡 Tip of the Day</span>
        <p>{TIPS[tipIdx]}</p>
      </div>

      {/* Latest Vitals Summary */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2>📊 Latest Vitals</h2>
          <button className="hd-link-btn" onClick={() => navigate("/vitals")}>
            + Add Reading
          </button>
        </div>
        {!latestVitals ? (
          <div className="hd-empty-card">
            <span>No vitals recorded yet.</span>
            <button onClick={() => navigate("/vitals")}>Log Your First Entry →</button>
          </div>
        ) : (
          <div className="hd-vitals-grid">
            {[
              { icon: "🩸", label: "Blood Pressure", value: latestVitals.bp || "—",          type: "bp" },
              { icon: "💉", label: "Blood Sugar",    value: latestVitals.sugar || "—",       type: "sugar",       unit: "mg/dL" },
              { icon: "🫀", label: "Pulse",          value: latestVitals.pulse || "—",       type: "pulse",       unit: "bpm" },
              { icon: "🌡️", label: "Temperature",   value: latestVitals.temperature || "—", type: "temperature", unit: "°C" },
            ].map(v => {
              const badge = v.value !== "—" ? getBadge(v.type, v.value) : null;
              return (
                <div key={v.label} className={`hd-vital-card ${badge === "danger" ? "card-danger" : badge === "warning" ? "card-warn" : ""}`}>
                  <div className="vital-icon">{v.icon}</div>
                  <div className="vital-value">{v.value}{v.unit ? <small> {v.unit}</small> : null}</div>
                  <div className="vital-label">{v.label}</div>
                  {badge && badge !== "normal" && (
                    <span className={`vital-badge ${badge}`}>{badge === "danger" ? "⚠️ High" : "Elevated"}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {latestVitals && (
          <p className="hd-recorded-at">Last recorded: {fmtDate(latestVitals.date)}</p>
        )}
      </section>

      {/* Today's Medicines */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2>💊 Today's Medicines</h2>
          <button className="hd-link-btn" onClick={() => navigate("/reminder")}>
            Manage Reminders
          </button>
        </div>
        {reminders.length === 0 ? (
          <div className="hd-empty-card">
            <span>No medicine reminders set.</span>
            <button onClick={() => navigate("/reminder")}>Add Medicine →</button>
          </div>
        ) : (
          <div className="hd-reminder-list">
            {reminders.slice(0, 4).map(r => {
              const [h, m] = r.time.split(":").map(Number);
              const ampm = h >= 12 ? "PM" : "AM";
              const h12  = h % 12 || 12;
              return (
                <div key={r.id} className="hd-reminder-item">
                  <span className="rem-icon">💊</span>
                  <div className="rem-info">
                    <strong>{r.name}</strong>
                    <small>{r.frequency}{r.dosage ? ` · ${r.dosage}` : ""}</small>
                  </div>
                  <span className="rem-time">⏰ {h12}:{String(m).padStart(2,"0")} {ampm}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Prescriptions */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2>📂 Recent Prescriptions</h2>
          <button className="hd-link-btn" onClick={() => navigate("/records")}>View All</button>
        </div>
        {loadingRx ? (
          <p className="hd-loading">⏳ Loading…</p>
        ) : prescriptions.length === 0 ? (
          <div className="hd-empty-card">
            <span>No prescriptions found for your name.</span>
            <small>Ask your doctor to write a digital prescription.</small>
          </div>
        ) : (
          <div className="hd-rx-list">
            {prescriptions.map(rx => (
              <div key={rx.id} className="hd-rx-card">
                <div className="rx-doc">👨‍⚕️ Dr. {rx.doctorName || "Unknown"}</div>
                <div className="rx-diag">🔍 {rx.diagnosis}</div>
                {rx.medications && <div className="rx-meds">💊 {rx.medications}</div>}
                <div className="rx-date">{fmtDate(rx.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Navigation */}
      <section className="hd-section">
        <h2>⚡ Quick Access</h2>
        <div className="hd-quick-grid">
          {quickLinks.map(link => (
            <button
              key={link.path}
              className="hd-quick-card"
              style={{ "--accent": link.color }}
              onClick={() => navigate(link.path)}
            >
              <span className="quick-icon">{link.icon}</span>
              <span className="quick-label">{link.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
      </div>
  );
}
