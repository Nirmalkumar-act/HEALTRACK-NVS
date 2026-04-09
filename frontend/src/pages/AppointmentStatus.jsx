// src/pages/AppointmentStatus.jsx — Patient Token-based Appointment Tracker
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import "../styles/AppointmentStatus.css";

const STATUS_INFO = {
  WAITING:         { label: "⏳ Waiting",         cls: "st-waiting",  msg: "You are in the queue. Please wait in the waiting area."  },
  IN_CONSULTATION: { label: "🩺 In Consultation", cls: "st-consult",  msg: "You are currently with the doctor."                     },
  DONE:            { label: "✅ Consultation Done",cls: "st-done",    msg: "Your consultation is complete. Have a healthy day!"      },
  CANCELLED:       { label: "✖ Cancelled",        cls: "st-cancel",  msg: "This appointment was cancelled. Please rebook if needed." },
};

const STEPS = ["Booked", "Waiting", "In Consultation", "Done"];

function StepProgress({ status }) {
  const stepMap = { WAITING: 1, IN_CONSULTATION: 2, DONE: 3, CANCELLED: -1 };
  const active  = stepMap[status] ?? 0;
  if (status === "CANCELLED") return null;
  return (
    <div className="as-steps">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step-item ${i <= active ? "done" : ""} ${i === active ? "current" : ""}`}>
            <div className="step-circle">{i < active ? "✓" : i + 1}</div>
            <span className="step-label">{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line ${i < active ? "done" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AppointmentStatus() {
  const { user } = useContext(AuthContext);
  const [tokenInput, setTokenInput] = useState("");
  const [nameInput, setNameInput]   = useState(user?.name || "");
  const [booking, setBooking]       = useState(null);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [myBookings, setMyBookings]   = useState([]);
  const [tab, setTab]                 = useState("token"); // "token" | "mine"
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown]     = useState(30);

  // Load all bookings once for "my bookings" tab
  useEffect(() => {
    api.get("/bookings")
      .then(res => setAllBookings(res.data || []))
      .catch(() => {});
  }, []);

  // Filter by name
  useEffect(() => {
    if (!nameInput.trim()) { setMyBookings([]); return; }
    const filtered = allBookings.filter(b =>
      b.name?.toLowerCase().includes(nameInput.toLowerCase())
    );
    setMyBookings(filtered);
  }, [nameInput, allBookings]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return;
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          handleSearch(null, true);  // silent refresh
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, tokenInput]);

  const handleSearch = async (e, silent = false) => {
    if (e) e.preventDefault();
    const tok = parseInt(tokenInput);
    if (!tok) { setError("Please enter a valid token number."); return; }
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings");
      const found = (res.data || []).find(b => b.token === tok);
      if (found) {
        setBooking(found);
        setAllBookings(res.data);
      } else {
        setBooking(null);
        setError(`No appointment found with token #${tok}.`);
      }
    } catch {
      setError("Failed to fetch status. Please try again.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const statusInfo = booking ? (STATUS_INFO[booking.status] || STATUS_INFO.WAITING) : null;

  const fmtDateTime = (d, t) => [d, t].filter(Boolean).join(" · ") || "—";

  return (
    <div className="as-wrapper">
      <div className="as-content">
      <div className="as-header">
        <h1>🔖 Appointment Status</h1>
        <p>Track your appointment queue position in real time</p>
      </div>

      {/* Tabs */}
      <div className="as-tabs">
        <button className={`as-tab ${tab === "token" ? "active" : ""}`} onClick={() => setTab("token")}>
          🔢 Check by Token
        </button>
        <button className={`as-tab ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>
          👤 My Appointments
        </button>
      </div>

      {/* ── Token Lookup ── */}
      {tab === "token" && (
        <div className="as-card">
          <form onSubmit={handleSearch} className="as-form">
            <div className="as-input-wrap">
              <span className="as-input-icon">🔢</span>
              <input
                type="number"
                placeholder="Enter your booking token (e.g. 5231)"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="as-input"
                min="1000"
                max="9999"
              />
            </div>
            <button type="submit" className="as-search-btn" disabled={loading}>
              {loading ? "Searching…" : "🔍 Check Status"}
            </button>
          </form>

          {error && <p className="as-error">❌ {error}</p>}

          {booking && (
            <div className="as-result">
              {/* Status Banner */}
              <div className={`as-status-banner ${statusInfo.cls}`}>
                <span className="as-status-label">{statusInfo.label}</span>
                <p className="as-status-msg">{statusInfo.msg}</p>
              </div>

              {/* Progress Steps */}
              <StepProgress status={booking.status || "WAITING"} />

              {/* Booking Details */}
              <div className="as-details">
                <div className="as-detail-row">
                  <span className="dt-label">Token</span>
                  <span className="dt-badge">#{booking.token}</span>
                </div>
                <div className="as-detail-row">
                  <span className="dt-label">Patient</span>
                  <span>{booking.name}</span>
                </div>
                <div className="as-detail-row">
                  <span className="dt-label">Doctor</span>
                  <span>{booking.doctor || "—"}</span>
                </div>
                <div className="as-detail-row">
                  <span className="dt-label">Hospital</span>
                  <span>{booking.hospital || "—"}</span>
                </div>
                <div className="as-detail-row">
                  <span className="dt-label">Scheduled</span>
                  <span>{fmtDateTime(booking.bookingDate, booking.bookingTime)}</span>
                </div>
                {booking.condition && (
                  <div className="as-detail-row">
                    <span className="dt-label">Condition</span>
                    <span>{booking.condition}</span>
                  </div>
                )}
              </div>

              {/* Auto-refresh toggle */}
              <div className="as-refresh-row">
                <button
                  className={`as-refresh-btn ${autoRefresh ? "on" : ""}`}
                  onClick={() => setAutoRefresh(p => !p)}
                >
                  {autoRefresh ? `🔄 Auto-refresh ON (${countdown}s)` : "🔄 Enable Auto-refresh"}
                </button>
                <button className="as-refresh-btn" onClick={() => handleSearch(null, false)}>
                  ↺ Refresh Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── My Appointments Tab ── */}
      {tab === "mine" && (
        <div className="as-card">
          <div className="as-input-wrap" style={{ marginBottom: 20 }}>
            <span className="as-input-icon">👤</span>
            <input
              type="text"
              placeholder="Enter your full name as registered…"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="as-input"
            />
          </div>

          {myBookings.length === 0 && nameInput.trim() && (
            <p className="as-error">No appointments found for "{nameInput}".</p>
          )}

          <div className="as-my-list">
            {myBookings.map(b => {
              const si = STATUS_INFO[b.status] || STATUS_INFO.WAITING;
              return (
                <div key={b.id} className="as-my-card">
                  <div className="my-card-top">
                    <span className="my-token">#{b.token}</span>
                    <span className={`my-status ${si.cls}`}>{si.label}</span>
                  </div>
                  <div className="my-card-info">
                    <span>👨‍⚕️ {b.doctor || "—"}</span>
                    <span>🏥 {b.hospital || "—"}</span>
                    <span>📅 {fmtDateTime(b.bookingDate, b.bookingTime)}</span>
                  </div>
                  {b.condition && (
                    <div className="my-card-condition">❤️ {b.condition}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>{/* end as-content */}
    </div>
  );
}
