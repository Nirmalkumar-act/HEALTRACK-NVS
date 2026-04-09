// src/pages/MedicineReminder.jsx
import React, { useState, useEffect, useRef } from "react";
import "../styles/MedicineReminder.css";

const STORAGE_KEY = "healtrack_reminders";
const EMPTY_FORM = { name: "", dosage: "", time: "", frequency: "Once daily", notes: "" };

const FREQUENCIES = [
  "Once daily", "Twice daily", "Three times daily",
  "Every 6 hours", "Every 8 hours", "Every 12 hours",
  "Weekly", "As needed",
];

function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendNotification(med) {
  if (Notification.permission === "granted") {
    new Notification("💊 Medicine Reminder — HealTrack", {
      body: `Time to take ${med.name}${med.dosage ? ` (${med.dosage})` : ""}`,
      icon: "/favicon.ico",
    });
  }
}

export default function MedicineReminder() {
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [activeNow, setActiveNow] = useState(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  // Check every 30 seconds if any reminder matches current time (HH:MM)
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const firing = new Set();
      reminders.forEach(r => {
        if (r.time === hhmm) {
          firing.add(r.id);
          if (notifEnabled) sendNotification(r);
        }
      });
      setActiveNow(firing);
    };
    check();
    timerRef.current = setInterval(check, 30000);
    return () => clearInterval(timerRef.current);
  }, [reminders, notifEnabled]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdd = e => {
    e.preventDefault();
    if (!form.name.trim() || !form.time) return;
    setReminders(prev => [
      { ...form, id: Date.now(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setForm({ ...EMPTY_FORM });
  };

  const handleDelete = id => setReminders(prev => prev.filter(r => r.id !== id));

  const toggleNotifications = () => {
    if (!notifEnabled) {
      requestNotificationPermission();
      setNotifEnabled(true);
    } else {
      setNotifEnabled(false);
    }
  };

  const toAMPM = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="reminder-wrapper">
      <div className="reminder-header">
        <h1>💊 Medicine Reminders</h1>
        <p>Set daily medication alerts with browser notifications</p>
      </div>

      <div className="reminder-content">

        {/* Notification toggle */}
        <div className="notification-toggle">
          <span>🔔 Browser Notifications:</span>
          <button
            className={`toggle-btn ${notifEnabled ? "on" : "off"}`}
            onClick={toggleNotifications}
          >
            {notifEnabled ? "Enabled ✓" : "Enable"}
          </button>
          {!("Notification" in window) && (
            <span style={{ color: "#e96c6c", fontSize: "0.82rem" }}>
              ⚠️ Notifications not supported in this browser
            </span>
          )}
        </div>

        {/* Add reminder form */}
        <div className="reminder-form-card">
          <h2>➕ Add Medicine Reminder</h2>
          <form onSubmit={handleAdd}>
            <div className="reminder-grid">
              <div className="reminder-field">
                <label>Medicine Name *</label>
                <input
                  name="name"
                  placeholder="e.g. Metformin 500mg"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="reminder-field">
                <label>Dosage</label>
                <input
                  name="dosage"
                  placeholder="e.g. 1 tablet"
                  value={form.dosage}
                  onChange={handleChange}
                />
              </div>

              <div className="reminder-field">
                <label>Reminder Time *</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="reminder-field">
                <label>Frequency</label>
                <select name="frequency" value={form.frequency} onChange={handleChange}>
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div className="reminder-field" style={{ gridColumn: "1 / -1" }}>
                <label>Notes (optional)</label>
                <input
                  name="notes"
                  placeholder="e.g. Take after meals, avoid with milk..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="reminder-add-btn">
              ⏰ Add Reminder
            </button>
          </form>
        </div>

        {/* Active reminders list */}
        {reminders.length === 0 ? (
          <div className="no-reminders">
            💊 No reminders yet. Add your first medicine above!
          </div>
        ) : (
          <div className="reminders-list">
            {reminders.map(r => (
              <div
                key={r.id}
                className={`reminder-item ${activeNow.has(r.id) ? "active-now" : ""}`}
              >
                <div className="reminder-info">
                  <h4>
                    💊 {r.name}
                    {activeNow.has(r.id) && (
                      <span style={{ marginLeft: 10, color: "#43e97b", fontSize: "0.78rem" }}>
                        🔔 NOW!
                      </span>
                    )}
                  </h4>
                  <p>
                    {r.dosage && <span>{r.dosage} · </span>}
                    <span className="freq-badge">{r.frequency}</span>
                    {r.notes && <span style={{ marginLeft: 6 }}>· {r.notes}</span>}
                  </p>
                </div>
                <div className="reminder-meta">
                  <span className="reminder-time">⏰ {toAMPM(r.time)}</span>
                  <button className="reminder-delete" onClick={() => handleDelete(r.id)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
