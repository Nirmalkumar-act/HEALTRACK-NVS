// src/pages/PatientHistoryViewer.jsx
// Patient Full History Viewer — Search by name + phone, view all visits & prescriptions, download as PDF
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/PatientHistory.css";

export default function PatientHistoryViewer() {
  const navigate = useNavigate();

  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [result,   setResult]   = useState(null);   // null = no search yet
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!name.trim() && !phone.trim()) {
      setError("Please enter at least a Patient Name or Phone Number.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (name.trim())  params.append("name",  name.trim());
      if (phone.trim()) params.append("phone", phone.trim());

      const res = await api.get(`/patient-history/full?${params.toString()}`);
      setResult(res.data);
    } catch (err) {
      setError("Failed to load patient history. Please check backend connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Download as PDF (browser print) ──────────────────────────────────────
  const handleDownload = () => {
    window.print();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmtDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return val; }
  };

  const statusLabel = (s) => {
    const map = {
      DONE: "✅ Done",
      WAITING: "⏳ Waiting",
      IN_CONSULTATION: "🩺 In Consultation",
      CANCELLED: "✖ Cancelled",
    };
    return map[s] || s || "Waiting";
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ph-wrapper">

      {/* Header */}
      <div className="ph-header">
        <button className="ph-back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>📁 Patient Full History</h1>
        <p>Search a returning patient by name and/or phone number to view their complete hospital record.</p>
      </div>

      {/* Search Card */}
      <div className="ph-search-card">
        <h2>🔍 Search Patient</h2>
        <form onSubmit={handleSearch}>
          <div className="ph-search-row">
            <div className="ph-field">
              <label>Patient Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="ph-field">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="ph-search-btn" disabled={loading}>
              {loading ? "Searching…" : "🔍 Search"}
            </button>
          </div>
        </form>

        {error && (
          <p style={{ marginTop: 14, color: "#f87171", fontWeight: 600, fontSize: "0.88rem" }}>
            ❌ {error}
          </p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="ph-result">

          {/* Patient Banner */}
          <div className="ph-patient-banner">
            <div className="ph-patient-info">
              <h3>👤 {result.patientName || result.phone || "Patient"}</h3>
              <p>
                {result.phone && <>📞 {result.phone}</>}
                {result.phone && result.patientName && " · "}
                Full Hospital Record
              </p>
            </div>

            <div className="ph-stats">
              <div className="ph-stat-badge">
                <span>{result.totalVisits ?? 0}</span>
                <small>Visits</small>
              </div>
              <div className="ph-stat-badge">
                <span>{result.totalPrescriptions ?? 0}</span>
                <small>Prescriptions</small>
              </div>
            </div>

            <button className="ph-download-btn" onClick={handleDownload}>
              📥 Download as PDF
            </button>
          </div>

          {/* Visit / Booking History */}
          <div className="ph-section">
            <h2>📋 Visit History ({result.bookings?.length ?? 0} records)</h2>
            {!result.bookings || result.bookings.length === 0 ? (
              <p className="ph-empty">No visit records found for this patient.</p>
            ) : (
              <div className="ph-table-wrap">
                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Condition</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.bookings.map((b) => {
                      const s = b.status || "WAITING";
                      return (
                        <tr key={b.id}>
                          <td><strong>#{b.token}</strong></td>
                          <td>{fmtDate(b.bookingDate)}</td>
                          <td>{b.doctor || "—"}</td>
                          <td>{b.condition || "—"}</td>
                          <td>{b.age || "—"}</td>
                          <td>{b.gender || "—"}</td>
                          <td>
                            <span className={`ph-status-badge ph-status-${s}`}>
                              {statusLabel(s)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Prescription History */}
          <div className="ph-section">
            <h2>💊 Prescription History ({result.prescriptions?.length ?? 0} records)</h2>
            {!result.prescriptions || result.prescriptions.length === 0 ? (
              <p className="ph-empty">No prescriptions found for this patient.</p>
            ) : (
              <div className="ph-table-wrap">
                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Medications</th>
                      <th>Dosage Instructions</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.prescriptions.map((rx) => (
                      <tr key={rx.id}>
                        <td>{fmtDate(rx.createdAt)}</td>
                        <td>{rx.doctorName || "—"}</td>
                        <td>{rx.diagnosis || "—"}</td>
                        <td style={{ fontWeight: 600 }}>{rx.medications || "—"}</td>
                        <td>{rx.dosageInstructions || "—"}</td>
                        <td>{rx.additionalNotes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
