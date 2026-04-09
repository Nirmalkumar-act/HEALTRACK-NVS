// src/pages/WaitingDisplay.jsx
import React, { useEffect, useState, useRef } from "react";
import { useBooking } from "../context/BookingContext";
import "../styles/WaitingDisplay.css";

export default function WaitingDisplay() {
  const { bookings, setBookings, nextPatient, clearQueue, doctors } = useBooking();
  const [time,  setTime]  = useState(new Date());
  const [popup, setPopup] = useState(null);
  const audioRef      = useRef(null);
  const nowServingRef = useRef(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load only TODAY's ACTIVE bookings from backend (exclude DONE + CANCELLED)
  const todayISO = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    fetch(`http://localhost:8081/api/bookings?date=${todayISO}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out DONE and CANCELLED — those are history, not in the queue
          const activeOnly = data.filter(
            b => b.status !== "DONE" && b.status !== "CANCELLED"
          );
          setBookings(activeOnly);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to Now Serving
  useEffect(() => {
    nowServingRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bookings]);

  const genderIcon = g =>
    g === "Male" ? "♂" : g === "Female" ? "♀" : g === "Other" ? "⚧" : "❓";

  // Finish & Call Next — marks patient DONE in backend + removes from frontend display
  const handleNext = () => {
    if (bookings.length === 0) return;
    const current = bookings[0];
    if (doctors[current.doctor] === false) {
      if (!window.confirm(
        `⚠️ Doctor ${current.doctor} is NOT AVAILABLE.\nProceed anyway?`
      )) return;
    }

    // 1. Remove from shared context (WaitingDisplay + DoctorDashboard both update)
    nextPatient();

    // 2. Mark DONE in backend so it won't come back on re-fetch
    if (current.id) {
      fetch(`http://localhost:8081/api/bookings/${current.id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "DONE" }),
      }).catch(() => {/* fail silently — display is already updated */});
    }

    // 3. Show popup notification
    const next = bookings[1];
    setPopup(
      next
        ? `✅ ${current.name} done. Now serving: ${next.name} (Token #${next.token})`
        : `✅ ${current.name} done. Queue is empty! 🎉`
    );
    audioRef.current?.play().catch(() => {});
    setTimeout(() => setPopup(null), 4000);
  };

  return (
    <div className="waiting-display">
      <h1>⏳ Waiting Room Display</h1>
      <p className="clock">
        {time.toLocaleDateString("en-IN", {
          weekday: "long", day: "2-digit", month: "short", year: "numeric"
        })}&nbsp;|&nbsp;{time.toLocaleTimeString()}
      </p>
      <p className="waiting-count">
        👥 {bookings.length} patient{bookings.length !== 1 ? "s" : ""} in queue
      </p>

      {bookings.length === 0 ? (
        <p className="empty">🎉 No patients waiting right now.</p>
      ) : (
        <>
          {/* Now Serving Card */}
          <div className="now-serving-card" ref={nowServingRef}>
            <h2>👩‍⚕️ Now Serving</h2>
            <p>
              <b>Token:</b>&nbsp;
              <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                #{bookings[0].token}
              </span>
            </p>
            <p>
              <b>Name:</b>&nbsp;{bookings[0].name}&nbsp;
              ({bookings[0].age} yrs, {genderIcon(bookings[0].gender)})
            </p>
            <p>
              <b>Doctor:</b>&nbsp;{bookings[0].doctor}
              {doctors[bookings[0].doctor] === false ? (
                <span style={{ marginLeft: 8, fontSize: "0.78rem", fontWeight: 700,
                  background: "#fce4ec", color: "#c62828", padding: "2px 10px", borderRadius: 20 }}>
                  🔴 Not Available
                </span>
              ) : (
                <span style={{ marginLeft: 8, fontSize: "0.78rem", fontWeight: 700,
                  background: "#e8f5e9", color: "#2e7d32", padding: "2px 10px", borderRadius: 20 }}>
                  🟢 Available
                </span>
              )}
            </p>
            <p><b>Problem:</b>&nbsp;{bookings[0].condition || "N/A"}</p>
            {doctors[bookings[0].doctor] === false && (
              <p style={{ color: "#c62828", fontWeight: 700, fontSize: "0.88rem", margin: "6px 0" }}>
                ⚠️ Doctor unavailable. Please reassign or wait.
              </p>
            )}
            <button className="btn primary" onClick={handleNext}>
              ✅ Finish &amp; Call Next
            </button>
          </div>

          {/* Queue Table */}
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Gender</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>ETA</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr key={b.id ?? b.token ?? idx} className={idx === 0 ? "active-row" : ""}>
                  <td data-label="Token">#{b.token}</td>
                  <td data-label="Patient">{b.name} ({b.age} yrs)</td>
                  <td data-label="Gender" className={`gender ${b.gender?.toLowerCase() || ""}`}>
                    {genderIcon(b.gender)} {b.gender}
                  </td>
                  <td data-label="Doctor"
                    style={{ fontWeight: 600, color: doctors[b.doctor] === false ? "#c62828" : "#2e7d32" }}>
                    {b.doctor}
                    {doctors[b.doctor] === false
                      ? <span style={{ fontSize: "0.72rem", marginLeft: 6, background: "#fce4ec", padding: "1px 7px", borderRadius: 12 }}>🔴 N/A</span>
                      : <span style={{ fontSize: "0.72rem", marginLeft: 6, background: "#e8f5e9", padding: "1px 7px", borderRadius: 12 }}>🟢</span>
                    }
                  </td>
                  <td data-label="Status">
                    {idx === 0 ? "🟢 Now Serving" : "⏳ Waiting"}
                  </td>
                  <td data-label="ETA">{idx === 0 ? "Ongoing" : `~${idx * 10} min`}</td>
                  <td data-label="Date">{b.bookingDate || b.date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="queue-controls">
            <button className="btn danger"
              onClick={() => {
                if (window.confirm("Clear the queue display? Backend records are safe.")) {
                  clearQueue();
                }
              }}>
              🗑 Clear Queue Display
            </button>
          </div>
        </>
      )}

      {popup && <div className="popup">{popup}</div>}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  );
}
