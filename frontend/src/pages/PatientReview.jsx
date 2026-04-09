// src/pages/PatientReview.jsx  (Enhanced with Doctor Rating + Backend integration)
import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/PatientReview.css";

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function PatientReview() {
  const [newReview, setNewReview] = useState({
    doctorName: "", patientName: "", rating: 0, comment: "",
  });
  const [hovered, setHovered] = useState(0);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [doctorStats, setDoctorStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch stats when doctor name searched
  const fetchDoctorStats = async (e) => {
    e.preventDefault();
    if (!searchDoctor.trim()) return;
    setLoadingStats(true);
    setDoctorStats(null);
    try {
      const res = await api.get(`/reviews/doctor?name=${encodeURIComponent(searchDoctor.trim())}`);
      setDoctorStats(res.data);
    } catch {
      setDoctorStats({ doctorName: searchDoctor, totalReviews: 0, averageRating: 0, reviews: [] });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!newReview.doctorName.trim() || !newReview.patientName.trim()) {
      setError("Please fill in doctor and your name.");
      return;
    }
    if (newReview.rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", newReview);
      setSuccess(`✅ Thank you! Your review for Dr. ${newReview.doctorName} has been submitted.`);
      setNewReview({ doctorName: "", patientName: "", rating: 0, comment: "" });
      setHovered(0);
      // Refresh stats if showing that doctor
      if (searchDoctor.trim().toLowerCase() === newReview.doctorName.trim().toLowerCase()) {
        fetchDoctorStats({ preventDefault: () => {} });
      }
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, max = 5, size = "1.3rem") =>
    Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ color: i < count ? "#f7971e" : "rgba(255,255,255,0.2)", fontSize: size }}>★</span>
    ));

  const formatDate = (dt) => {
    if (!dt) return "";
    try { return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return ""; }
  };

  return (
    <div className="review-container">
      <h2>⭐ Doctor Ratings &amp; Reviews</h2>

      {/* ── Submit Review Form ─────────────────────────── */}
      <section className="review-form-section">
        <h3>📝 Leave a Review</h3>
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-row">
            <input
              type="text"
              placeholder="Doctor's Name *"
              value={newReview.doctorName}
              onChange={e => setNewReview(p => ({ ...p, doctorName: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Your Name *"
              value={newReview.patientName}
              onChange={e => setNewReview(p => ({ ...p, patientName: e.target.value }))}
              required
            />
          </div>

          {/* Star Picker */}
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star-pick ${star <= (hovered || newReview.rating) ? "active" : ""}`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setNewReview(p => ({ ...p, rating: star }))}
                title={STAR_LABELS[star]}
              >
                ★
              </span>
            ))}
            {(hovered || newReview.rating) > 0 && (
              <span className="star-label">{STAR_LABELS[hovered || newReview.rating]}</span>
            )}
          </div>

          <textarea
            placeholder="Share your experience (optional)..."
            value={newReview.comment}
            onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
            rows={3}
          />

          {error && <p className="review-error">❌ {error}</p>}
          {success && <p className="review-success">{success}</p>}

          <button type="submit" className="review-submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </section>

      {/* ── Search Doctor Stats ────────────────────────── */}
      <section className="stats-section">
        <h3>🔍 Look Up Doctor Reviews</h3>
        <form className="stats-search" onSubmit={fetchDoctorStats}>
          <input
            type="text"
            placeholder="Enter doctor's name..."
            value={searchDoctor}
            onChange={e => setSearchDoctor(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {loadingStats && <p className="review-loading">⏳ Loading…</p>}

        {doctorStats && (
          <div className="doctor-stats-card">
            <div className="stats-top">
              <div>
                <h4>👨‍⚕️ Dr. {doctorStats.doctorName}</h4>
                <p>{doctorStats.totalReviews} review{doctorStats.totalReviews !== 1 ? "s" : ""}</p>
              </div>
              <div className="avg-rating">
                <span className="avg-number">{doctorStats.averageRating || "—"}</span>
                <div>{renderStars(Math.round(doctorStats.averageRating || 0), 5, "1.1rem")}</div>
              </div>
            </div>

            <div className="reviews-list">
              {doctorStats.reviews?.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
                  No reviews yet for this doctor.
                </p>
              ) : (
                doctorStats.reviews?.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-card-top">
                      <h4>{r.patientName || "Anonymous"}</h4>
                      <span className="review-date">{formatDate(r.createdAt)}</span>
                    </div>
                    <div>{renderStars(r.rating)}</div>
                    {r.comment && <p className="review-comment">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
