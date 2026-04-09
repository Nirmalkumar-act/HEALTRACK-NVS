// src/pages/PatientRecords.jsx — shows ONLY backend prescription data
import React, { useState } from "react";
import api from "../api/api";
import "../styles/PatientRecords.css";

export default function PatientRecords() {
  const [search,   setSearch]   = useState("");
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setSearched(false);
    setRecords([]);
    try {
      const res = await api.get(`/prescriptions/patient?name=${encodeURIComponent(q)}`);
      setRecords(res.data || []);
      setSearched(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setRecords([]);
        setSearched(true);
      } else {
        setError("Failed to load records. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setRecords([]);
    setSearched(false);
    setError("");
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    try {
      return new Date(dt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return dt; }
  };

  return (
    <div className="records-wrapper">

      {/* Header */}
      <div className="records-header">
        <h1>📂 My Medical Records</h1>
        <p>Search your prescriptions written by your doctor</p>
      </div>

      {/* Search form — always visible */}
      <form className="records-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="🔍 Enter your full name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" disabled={loading || !search.trim()}>
          {loading ? "⏳ Searching…" : "🔍 Search"}
        </button>
        {searched && (
          <button type="button" className="records-reset-btn" onClick={handleReset}>
            ✕ Clear
          </button>
        )}
      </form>

      {/* Error */}
      {error && <p className="records-error">❌ {error}</p>}

      {/* No results found */}
      {!loading && searched && records.length === 0 && !error && (
        <div className="records-empty">
          <span style={{ fontSize: "2.5rem" }}>📭</span>
          <p>No records found for <strong>"{search}"</strong></p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>
            Ask your doctor to write a digital prescription during your next visit.
          </p>
          <button className="records-new-search-btn" onClick={handleReset}>
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Results count bar */}
      {!loading && records.length > 0 && (
        <div className="records-results-bar">
          <span>
            ✅ Found <strong>{records.length}</strong> record{records.length !== 1 ? "s" : ""} for&nbsp;
            <strong>"{search}"</strong>
          </span>
          <button className="records-new-search-btn" onClick={handleReset}>
            🔄 New Search
          </button>
        </div>
      )}

      {/* Records grid */}
      <div className="records-grid">
        {records.map((rx, idx) => (
          <div key={rx.id ?? idx} className="record-card" style={{ animationDelay: `${idx * 0.06}s` }}>

            <div className="record-card-header">
              <h3>👨‍⚕️ Dr. {rx.doctorName || "Unknown"}</h3>
              <span className="record-date">{formatDate(rx.createdAt)}</span>
            </div>

            {rx.bookingToken > 0 && (
              <div className="record-field">
                <strong>Booking Token</strong>
                <span className="record-token">#{rx.bookingToken}</span>
              </div>
            )}

            <div className="record-field">
              <strong>Diagnosis</strong>
              <span>{rx.diagnosis || "—"}</span>
            </div>

            {rx.medications && (
              <div className="record-field">
                <strong>💊 Medications</strong>
                <span>{rx.medications}</span>
              </div>
            )}

            {rx.dosageInstructions && (
              <div className="record-field">
                <strong>📋 Dosage &amp; Instructions</strong>
                <span>{rx.dosageInstructions}</span>
              </div>
            )}

            {rx.additionalNotes && (
              <div className="record-field">
                <strong>📝 Notes</strong>
                <span>{rx.additionalNotes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
