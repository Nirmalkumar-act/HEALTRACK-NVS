import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import "../styles/BookingConfirmation.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { bookings } = useBooking();

  const booking = location.state?.booking;
  const [prevVisits,    setPrevVisits]    = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isReturning,   setIsReturning]   = useState(false);

  // ── Fetch previous visits from backend by name + phone ───────────────────
  useEffect(() => {
    if (!booking) return;

    // 1. Check current session context (same name)
    const sessionHistory = bookings.filter(b =>
      b.name?.toLowerCase().trim() === booking.name?.toLowerCase().trim() &&
      (b.token !== booking.token)   // exclude current booking
    );

    // 2. Also fetch from backend by name (+ phone if available)
    setLoadingHistory(true);
    const params = new URLSearchParams({ name: booking.name });
    if (booking.phone) params.append("phone", booking.phone);

    fetch(`${API_BASE}/bookings/history?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const backendHistory = Array.isArray(data) ? data : [];
        // Merge session + backend, deduplicate by token
        const merged = [...backendHistory];
        sessionHistory.forEach(s => {
          if (!merged.find(b => String(b.token) === String(s.token))) {
            merged.push(s);
          }
        });
        // Exclude current booking token
        const filtered = merged.filter(b => String(b.token) !== String(booking.token));
        setPrevVisits(filtered);
        setIsReturning(filtered.length > 0);
      })
      .catch(() => {
        // Backend unavailable — use session data only
        setPrevVisits(sessionHistory);
        setIsReturning(sessionHistory.length > 0);
      })
      .finally(() => setLoadingHistory(false));
  }, [booking]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!booking) {
    return (
      <div className="bc-wrapper">
        <h1>⚠️ No Booking Found</h1>
        <button className="bc-btn bc-btn-primary" onClick={() => navigate("/booking")}>
          ← Back to Booking
        </button>
      </div>
    );
  }

  const statusColor = s =>
    s === "DONE"           ? "#15803d" :
    s === "IN_CONSULTATION"? "#1d4ed8" :
    s === "CANCELLED"      ? "#dc2626" : "#92400e";

  return (
    <div className="bc-wrapper">

      {/* ── Header ── */}
      <div className="bc-hero">
        <div className="bc-hero-icon">✅</div>
        <div>
          <h1 className="bc-h1">Booking Confirmed!</h1>
          <p className="bc-sub">
            {isReturning
              ? `👋 Welcome back, ${booking.name}! Previous visit history shown below.`
              : `New patient registered successfully.`}
          </p>
        </div>
      </div>

      {/* ── Current Booking Card ── */}
      <div className="bc-card">
        <div className="bc-card-header">
          <span>🎫 Current Booking</span>
          <span className="bc-token-badge">Token #{booking.token}</span>
        </div>
        <div className="bc-card-body">
          <div className="bc-avatar">
            {booking.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="bc-info-grid">
            <div className="bc-info-row"><span>Name</span><b>{booking.name}</b></div>
            <div className="bc-info-row"><span>Age</span><b>{booking.age || "—"}</b></div>
            <div className="bc-info-row"><span>Gender</span><b>{booking.gender || "—"}</b></div>
            {booking.phone && <div className="bc-info-row"><span>Phone</span><b>{booking.phone}</b></div>}
            {booking.condition && <div className="bc-info-row"><span>Condition</span><b>{booking.condition}</b></div>}
            {(booking.doctor || booking.doctorname) &&
              <div className="bc-info-row"><span>Doctor</span><b>Dr. {booking.doctor || booking.doctorname}</b></div>}
            {booking.hospital &&
              <div className="bc-info-row"><span>Hospital</span><b>{booking.hospital}</b></div>}
            <div className="bc-info-row"><span>Date</span><b>{booking.bookingDate || booking.date}</b></div>
            <div className="bc-info-row"><span>Time</span><b>{booking.bookingTime || booking.time}</b></div>
            <div className="bc-info-row"><span>Status</span>
              <b><span className="bc-status bc-status-waiting">⏳ WAITING</span></b>
            </div>
          </div>
          <div className="bc-qr-col">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=6&data=${encodeURIComponent(
                `tok:${booking.token}|name:${booking.name}|ph:${booking.phone||""}`
              )}`}
              alt="Token QR"
              className="bc-qr-img"
            />
            <p className="bc-qr-label">Scan for token</p>
          </div>
        </div>
      </div>

      {/* ── Previous Visit History ── */}
      {isReturning || loadingHistory ? (
        <div className="bc-history">
          <div className="bc-history-header">
            🏥 Previous Visit History
            {isReturning && <span className="bc-returning-badge">🔄 Returning Patient</span>}
          </div>

          {loadingHistory ? (
            <p className="bc-loading">⏳ Loading visit history…</p>
          ) : (
            <div className="bc-history-table-wrap">
              <table className="bc-history-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Hospital</th>
                    <th>Condition</th>
                    <th>Medicine / Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prevVisits.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign:"center", color:"#94a3b8", padding:"20px" }}>
                      No previous visits found.
                    </td></tr>
                  ) : (
                    prevVisits.map((v, i) => (
                      <tr key={v.id || i}>
                        <td><strong>#{v.token || "—"}</strong></td>
                        <td>{v.bookingDate || v.date || "—"}</td>
                        <td>{v.doctor ? `Dr. ${v.doctor}` : "—"}</td>
                        <td>{v.hospital || "—"}</td>
                        <td>{v.condition || "—"}</td>
                        <td>
                          {v.notes
                            ? <span className="bc-medicine">💊 {v.notes}</span>
                            : <span style={{ color:"#94a3b8" }}>—</span>}
                        </td>
                        <td>
                          <span className="bc-status-chip" style={{ color: statusColor(v.status) }}>
                            {v.status || "DONE"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Actions ── */}
      <div className="bc-actions">
        <button className="bc-btn bc-btn-primary" onClick={() => navigate("/waiting")}>
          📋 View Waiting Room
        </button>
        <button className="bc-btn bc-btn-secondary" onClick={() => navigate("/dashboard")}>
          🩺 Doctor Dashboard
        </button>
        <button className="bc-btn bc-btn-secondary" onClick={() => navigate("/booking")}>
          ➕ Book Another
        </button>
      </div>
    </div>
  );
}
