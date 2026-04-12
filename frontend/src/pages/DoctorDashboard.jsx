// src/pages/DoctorDashboard.jsx — Enhanced Design with Status Tracking & Reviews
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import api from "../api/api";
import "../styles/DoctorDashboard.css";

const STATUS_FLOW = {
  WAITING:         { label: "⏳ Waiting",         cls: "status-waiting", next: "IN_CONSULTATION" },
  IN_CONSULTATION: { label: "🩺 In Consultation", cls: "status-consult",  next: "DONE" },
  DONE:            { label: "✅ Done",             cls: "status-done",    next: null },
  CANCELLED:       { label: "✖ Cancelled",        cls: "status-cancelled", next: null },
};

export default function DoctorDashboard() {
  // ── Only use what BookingContext actually provides ──────────────────────────
  const { bookings, setBookings, doctors, setDoctorAvailability } = useBooking();
  const navigate = useNavigate();

  const [search,       setSearch]       = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [time,         setTime]         = useState(new Date());
  const [updatingId,   setUpdatingId]   = useState(null);

  // Reviews panel
  const [reviewDoctor,   setReviewDoctor]   = useState("");
  const [reviewStats,    setReviewStats]    = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Today in ISO format — e.g. "2026-04-10"
  const todayISO = new Date().toISOString().slice(0, 10);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch only TODAY's bookings from backend ───────────────────────────────
  useEffect(() => {
    api.get(`/bookings?date=${todayISO}`)
      .then(res => setBookings(res.data || []))
      .catch(err => console.error("Failed to load bookings:", err));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const genderIcon = (gender) => {
    if (gender === "Male")   return "♂";
    if (gender === "Female") return "♀";
    if (gender === "Other")  return "⚧";
    return "❓";
  };

  // ── Status update ──────────────────────────────────────────────────────────
  // DONE / CANCELLED → remove from frontend view immediately (backend keeps the record)
  // Other statuses   → update in place
  const handleStatusChange = async (booking, newStatus) => {
    if (!booking.id) return;
    setUpdatingId(booking.id);
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: newStatus });
      if (newStatus === "DONE" || newStatus === "CANCELLED") {
        // Remove from frontend view — data is safely stored in backend
        setBookings(prev => prev.filter(b => b.id !== booking.id));
      } else {
        setBookings(prev => prev.map(b =>
          b.id === booking.id ? { ...b, status: newStatus } : b
        ));
      }
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel appointment for ${booking.name}?`)) return;
    await handleStatusChange(booking, "CANCELLED");
  };

  // ── Reviews lookup ─────────────────────────────────────────────────────────
  const fetchReviews = async (e) => {
    e.preventDefault();
    if (!reviewDoctor.trim()) return;
    setLoadingReviews(true);
    setReviewStats(null);
    try {
      const res = await api.get(`/reviews/doctor?name=${encodeURIComponent(reviewDoctor.trim())}`);
      setReviewStats(res.data);
    } catch {
      setReviewStats({ doctorName: reviewDoctor, totalReviews: 0, averageRating: 0, reviews: [] });
    } finally {
      setLoadingReviews(false);
    }
  };

  // ── Clear completed (DONE + CANCELLED) from local view ────────────────────
  const clearCompleted = () => {
    if (!window.confirm("Remove all DONE and CANCELLED records from view?")) return;
    setBookings(prev => prev.filter(b => b.status !== "DONE" && b.status !== "CANCELLED"));
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const allDoctors = [...new Set(bookings.map(b => b.doctor).filter(Boolean))];

  // Show only TODAY's active bookings (hide DONE and CANCELLED — they're in backend history)
  const todayBookings = bookings.filter(b => {
    const d = b.bookingDate || b.date || "";
    const isToday = !d ||
      d === todayISO ||
      d.startsWith(todayISO) ||
      new Date(d).toDateString() === new Date().toDateString();
    const isActive = b.status !== "DONE" && b.status !== "CANCELLED";
    return isToday && isActive;
  });

  // Today's doctors — auto-clears next day since derived from todayBookings
  const todayDoctors = [...new Set(todayBookings.map(b => b.doctor).filter(Boolean))];

  const filteredBookings = todayBookings.filter(b => {
    const matchesName   = b.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDoctor = filterDoctor ? b.doctor === filterDoctor : true;
    const matchesStatus = filterStatus ? (b.status || "WAITING") === filterStatus : true;
    return matchesName && matchesDoctor && matchesStatus;
  });

  // Summary counts from today's bookings only
  const counts = useMemo(() => ({
    total:   todayBookings.length,
    waiting: todayBookings.filter(b => (b.status || "WAITING") === "WAITING").length,
    consult: todayBookings.filter(b => b.status === "IN_CONSULTATION").length,
    done:    todayBookings.filter(b => b.status === "DONE").length,
  }), [todayBookings]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#f7971e" : "#ddd", fontSize: "1rem" }}>★</span>
    ));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="doctor-dashboard">
      <h1>👨‍⚕️ Doctor Dashboard</h1>
      <p className="clock">🕒 {time.toLocaleDateString()} | {time.toLocaleTimeString()}</p>


      {/* Doctor Availability — today's doctors only, auto-clears next day */}
      <div className="doctor-availability">
        <h2>👩‍⚕️ Doctors Availability — Today</h2>
        {todayDoctors.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: "0.88rem", margin: 0 }}>
            No doctors scheduled today. Book a patient to see them here.
          </p>
        ) : (
          todayDoctors.map(doc => (
            <div key={doc} className="doctor-item">
              <span>👨‍⚕️ {doc}</span>
              <button
                className="btn primary"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                onClick={() => setDoctorAvailability(doc, true)}
                disabled={doctors[doc] === true}
              >
                ✅ Available
              </button>
              <button
                className="btn danger"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                onClick={() => setDoctorAvailability(doc, false)}
                disabled={doctors[doc] === false}
              >
                ⛔ Not Available
              </button>
              {/* Status indicator */}
              <span style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                background: doctors[doc] === false ? "#fce4ec" : "#e8f5e9",
                color: doctors[doc] === false ? "#c62828" : "#2e7d32",
                marginLeft: "auto"
              }}>
                {doctors[doc] === false ? "🔴 Unavailable" : "🟢 Available"}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="doctor-summary">
        <div className="doctor-card">
          <h3>Total Patients</h3>
          <p>{counts.total}</p>
        </div>
        <div className="doctor-card" style={{ borderTop: "3px solid #f7971e" }}>
          <h3>⏳ Waiting</h3>
          <p style={{ color: "#f7971e" }}>{counts.waiting}</p>
        </div>
        <div className="doctor-card" style={{ borderTop: "3px solid #56ccf2" }}>
          <h3>🩺 In Consult</h3>
          <p style={{ color: "#56ccf2" }}>{counts.consult}</p>
        </div>
        <div className="doctor-card" style={{ borderTop: "3px solid #43e97b" }}>
          <h3>✅ Done</h3>
          <p style={{ color: "#43e97b" }}>{counts.done}</p>
        </div>
        <div className="doctor-card">
          <h3>Doctors Active</h3>
          <p>{allDoctors.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn primary" onClick={() => navigate("/prescription")}>
          📝 Write Prescription
        </button>
        <button className="btn primary" onClick={() => navigate("/booking")}>
          📑 Book Patient
        </button>
        {/* Clear Completed */}
        <button
          style={{
            padding: "9px 18px",
            borderRadius: "9px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 700,
            border: "1px solid #f48fb1",
            background: "#fce4ec",
            color: "#c62828",
            fontFamily: "Inter, sans-serif",
            marginLeft: "auto",
            transition: "all 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.background = "#ffcdd2"}
          onMouseOut={e => e.currentTarget.style.background = "#fce4ec"}
          onClick={clearCompleted}
        >
          🗑 Clear Completed
        </button>
      </div>

      {/* Today badge */}
      <p style={{ fontSize: "0.82rem", color: "#0077b6", marginBottom: 12, fontWeight: 600 }}>
        📅 Showing records for today: {todayISO}
      </p>

      {/* Search & Filter */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="🔍 Search patient by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
          <option value="">All Doctors</option>
          {allDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="WAITING">⏳ Waiting</option>
          <option value="IN_CONSULTATION">🩺 In Consultation</option>
          <option value="DONE">✅ Done</option>
          <option value="CANCELLED">✖ Cancelled</option>
        </select>
      </div>

      {/* Patient Table */}
      {filteredBookings.length === 0 ? (
        <p style={{ color: "#888", marginTop: 32, textAlign: "center", fontSize: "1rem", fontWeight: 500 }}>
          ✅ No patients found for today.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Condition</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, idx) => {
                const status     = b.status || "WAITING";
                const statusInfo = STATUS_FLOW[status] || STATUS_FLOW.WAITING;
                const isUpdating = updatingId === b.id;
                return (
                  <tr key={b.id || b.token} className={idx === 0 && status === "WAITING" ? "active-row" : ""}>
                    <td><strong>#{b.token}</strong></td>
                    <td>{b.name}</td>
                    <td>{b.age}</td>
                    <td className={`gender ${b.gender?.toLowerCase()}`}>
                      {genderIcon(b.gender)} {b.gender}
                    </td>
                    <td>{b.condition || "N/A"}</td>
                    <td className={doctors[b.doctor] === false ? "not-available" : ""}>
                      {b.doctor} {doctors[b.doctor] === false && "(N/A)"}
                    </td>
                    <td>{b.bookingDate || b.date || "—"}</td>
                    <td>
                      <span className={`status-badge ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {statusInfo.next && (
                          <button
                            className="btn primary"
                            style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(b, statusInfo.next)}
                          >
                            {isUpdating ? "…" : status === "WAITING" ? "▶ Start" : "✅ Done"}
                          </button>
                        )}
                        {status !== "DONE" && status !== "CANCELLED" && (
                          <button
                            className="btn danger"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                            disabled={isUpdating}
                            onClick={() => handleCancel(b)}
                          >
                            ✖
                          </button>
                        )}
                        <button
                          className="btn primary"
                          style={{ padding: "4px 10px", fontSize: "0.8rem", background: "#e3f2fd", color: "#0077b6", border: "1px solid #90caf9" }}
                          onClick={() => navigate("/prescription")}
                        >
                          📝 Rx
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reviews Panel */}
      <div className="reviews-panel" style={{ marginTop: 40 }}>
        <h2>⭐ Doctor Ratings Lookup</h2>
        <form onSubmit={fetchReviews} style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Enter doctor name..."
            value={reviewDoctor}
            onChange={e => setReviewDoctor(e.target.value)}
          />
          <button className="btn primary" type="submit">
            {loadingReviews ? "Loading…" : "🔍 Search Reviews"}
          </button>
        </form>

        {reviewStats && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: "#f7971e" }}>Dr. {reviewStats.doctorName}</h3>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                  {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 700, color: "#ffd200" }}>
                  {reviewStats.averageRating || "—"}
                </span>
                <div>{renderStars(Math.round(reviewStats.averageRating || 0))}</div>
              </div>
            </div>
            {reviewStats.reviews?.slice(0, 3).map(r => (
              <div key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "12px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: "0.9rem" }}>{r.patientName || "Anonymous"}</strong>
                  {renderStars(r.rating)}
                </div>
                {r.comment && <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
