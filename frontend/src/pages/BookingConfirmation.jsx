import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import "../styles/BookingConfirmation.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { bookings, addBooking } = useBooking();

  // Mode 1: We already generated the booking (Standard flow)
  const existingBooking = location.state?.booking;
  
  // Mode 2: We scanned a patient ID and need to check them in
  const scannedPatient = location.state?.scannedPatient;

  const targetPatient = existingBooking || scannedPatient;

  const [booking, setBooking] = useState(existingBooking || null);
  const [prevVisits, setPrevVisits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Form states for Check-In Mode
  const [checkInCondition, setCheckInCondition] = useState("");
  const [checkInDoctor, setCheckInDoctor] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Fetch previous visits from backend by name + phone ───────────────────
  useEffect(() => {
    if (!targetPatient) return;

    const sessionHistory = bookings.filter(b =>
      b.name?.toLowerCase().trim() === targetPatient.name?.toLowerCase().trim() &&
      (b.token !== booking?.token)
    );

    setLoadingHistory(true);
    const params = new URLSearchParams({ name: targetPatient.name });
    if (targetPatient.phone) params.append("phone", targetPatient.phone);

    fetch(`${API_BASE}/bookings/history?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const backendHistory = Array.isArray(data) ? data : [];
        const merged = [...backendHistory];
        sessionHistory.forEach(s => {
          if (!merged.find(b => String(b.token) === String(s.token))) {
            merged.push(s);
          }
        });
        const filtered = merged.filter(b => !booking || String(b.token) !== String(booking.token));
        setPrevVisits(filtered);
        setIsReturning(filtered.length > 0);
      })
      .catch(() => {
        setPrevVisits(sessionHistory);
        setIsReturning(sessionHistory.length > 0);
      })
      .finally(() => setLoadingHistory(false));
  }, [targetPatient]); 

  const handleGenerateToken = async () => {
    if (!checkInDoctor) {
      alert("Please enter a doctor's name for check-in.");
      return;
    }

    setIsGenerating(true);
    
    let patientAge = 0;
    if (scannedPatient.age) {
        patientAge = parseInt(scannedPatient.age);
        if (isNaN(patientAge)) patientAge = 0;
    }

    const newBooking = {
      token: Math.floor(1000 + Math.random() * 9000), // MUST be integer
      hospital: "HealTrack Main Hospital", 
      name: scannedPatient.name || "Unknown Patient",
      age: patientAge, // MUST be integer
      gender: scannedPatient.gender || "Other",
      phone: scannedPatient.phone || "",
      condition: checkInCondition || "General Setup",
      doctorname: checkInDoctor,
      doctor: checkInDoctor, 
      bookingDate: new Date().toISOString().slice(0, 10), // Strict YYYY-MM-DD
      bookingTime: new Date().toLocaleTimeString('en-US', { hour12: true }),
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('en-US', { hour12: true }),
      status: "WAITING"
    };

    try {
      await addBooking(newBooking);
      setBooking(newBooking);
    } catch (error) {
      console.error(error);
      alert("Failed to save booking to database. Please check backend connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!targetPatient) {
    return (
      <div className="bc-wrapper">
        <h1>⚠️ No Record Found</h1>
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

      <div className="bc-hero">
        <div className="bc-hero-icon">{booking ? "✅" : "🛎️"}</div>
        <div>
          <h1 className="bc-h1">{booking ? "Booking Confirmed!" : "Patient Check-In"}</h1>
          <p className="bc-sub">
            {booking 
               ? "Token allocated and added to the waiting queue."
               : "Review history and assign a token."}
          </p>
        </div>
      </div>

      {!booking && scannedPatient && (
        <div className="bc-card" style={{ border: "2px solid #0077b6" }}>
          <div className="bc-card-header" style={{ background: "#e0f2fe", color: "#0369a1" }}>
            <span>🛂 Reception Allocation</span>
            <span className="bc-token-badge" style={{ background: "#0369a1" }}>Pending</span>
          </div>
          
          <div className="bc-card-body" style={{ flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>Assign Token for {scannedPatient.name}</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", width: "100%", marginBottom: "15px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#64748b" }}>Condition / Reason</label>
                <input 
                  type="text" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Fever and Cough"
                  value={checkInCondition}
                  onChange={e => setCheckInCondition(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#64748b" }}>Doctor Name <span style={{color:"red"}}>*</span></label>
                <input 
                  type="text"
                  placeholder="e.g. Priya"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  value={checkInDoctor}
                  onChange={e => setCheckInDoctor(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="bc-btn bc-btn-primary" 
              style={{ width: "100%" }}
              onClick={handleGenerateToken}
              disabled={isGenerating || !checkInDoctor}
            >
              {isGenerating ? "⏳ Saving to Database..." : "🎟️ Generate Token & Check-In"}
            </button>
          </div>
        </div>
      )}

      {booking && (
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
              {booking.gender && <div className="bc-info-row"><span>Gender</span><b>{booking.gender}</b></div>}
              {booking.bloodGroup && <div className="bc-info-row"><span>Blood</span><b style={{color:"#e11d48"}}>{booking.bloodGroup}</b></div>}
              {booking.phone && <div className="bc-info-row"><span>Phone</span><b>{booking.phone}</b></div>}
              {booking.condition && <div className="bc-info-row"><span>Condition</span><b>{booking.condition}</b></div>}
              {(booking.doctor || booking.doctorname) &&
                <div className="bc-info-row"><span>Doctor</span><b>Dr. {booking.doctor || booking.doctorname}</b></div>}
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
      )}

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

      <div className="bc-actions">
        {booking && (
          <button className="bc-btn bc-btn-primary" onClick={() => navigate("/waiting")}>
            📋 View Waiting Room
          </button>
        )}
        <button className="bc-btn bc-btn-secondary" onClick={() => navigate("/dashboard")}>
          🩺 Doctor Dashboard
        </button>
        <button className="bc-btn bc-btn-secondary" onClick={() => navigate(booking ? "/booking" : "/qrscanner")}>
          {booking ? "➕ Book Another" : "📷 Scan Another ID"}
        </button>
      </div>
    </div>
  );
}
