// src/pages/PrescriptionForm.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import "../styles/PrescriptionForm.css";

export default function PrescriptionForm() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bookingToken: "",
    patientName: "",
    doctorName: user?.name || "",
    diagnosis: "",
    medications: "",
    dosageInstructions: "",
    additionalNotes: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // AI Clash Predictor States
  const [clashResult, setClashResult] = useState(null); // { status: "SAFE"|"WARNING"|"CRITICAL", msg: "" }
  const [checkingClash, setCheckingClash] = useState(false);

  // Check drug interactions using Gemini backend
  const handleCheckInteractions = async () => {
    if (!form.patientName.trim() || !form.medications.trim()) {
      alert("Please enter both Patient Name and Medications to check for interactions.");
      return;
    }
    
    setCheckingClash(true);
    setClashResult(null);
    try {
      const res = await api.post("/ai/check-clash", {
        patientName: form.patientName,
        newMedications: form.medications
      });
      
      const reply = res.data.result || "";
      let status = "SAFE";
      let msg = reply;
      
      if (reply.startsWith("[CRITICAL_CLASH]")) {
        status = "CRITICAL";
        msg = reply.replace("[CRITICAL_CLASH]", "").trim();
      } else if (reply.startsWith("[WARNING]")) {
        status = "WARNING";
        msg = reply.replace("[WARNING]", "").trim();
      } else if (reply.startsWith("[SAFE]")) {
        status = "SAFE";
        msg = reply.replace("[SAFE]", "").trim();
      }

      setClashResult({ status, msg });
    } catch (err) {
      console.error(err);
      setClashResult({ status: "WARNING", msg: "Could not reach AI analysis service. Please use manual clinical judgment." });
    } finally {
      setCheckingClash(false);
    }
  };

  // Fetch prescriptions written by this doctor
  useEffect(() => {
    if (!user?.name) return;
    setLoadingHistory(true);
    api.get(`/prescriptions/doctor?name=${encodeURIComponent(user.name)}`)
      .then(res => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [user, success]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.patientName.trim() || !form.diagnosis.trim()) {
      setError("Patient name and diagnosis are required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/prescriptions", {
        ...form,
        bookingToken: parseInt(form.bookingToken) || 0,
      });
      setSuccess(`✅ Prescription for ${form.patientName} saved successfully!`);
      setForm(prev => ({
        ...prev,
        bookingToken: "",
        patientName: "",
        diagnosis: "",
        medications: "",
        dosageInstructions: "",
        additionalNotes: "",
      }));
    } catch {
      setError("Failed to save prescription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    try {
      return new Date(dt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch { return dt; }
  };

  return (
    <div className="rx-wrapper">
      <div className="rx-card">
        <h1>🩺 Write Prescription</h1>
        <p className="subtitle">
          Digital prescription linked to a patient booking token
        </p>

        <form onSubmit={handleSubmit}>
          <div className="rx-grid">
            <div className="rx-field">
              <label>Booking Token (optional)</label>
              <input
                type="number"
                name="bookingToken"
                placeholder="e.g. 3847"
                value={form.bookingToken}
                onChange={handleChange}
              />
            </div>

            <div className="rx-field">
              <label>Patient Name *</label>
              <input
                type="text"
                name="patientName"
                placeholder="Full patient name"
                value={form.patientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="rx-field full">
              <label>Doctor Name</label>
              <input
                type="text"
                name="doctorName"
                placeholder="Your name"
                value={form.doctorName}
                onChange={handleChange}
              />
            </div>

            <div className="rx-field full">
              <label>Diagnosis *</label>
              <textarea
                name="diagnosis"
                placeholder="Primary diagnosis / clinical findings..."
                value={form.diagnosis}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="rx-field full">
              <label>Medications</label>
              <textarea
                name="medications"
                placeholder="List medications (e.g. Paracetamol 500mg, Amoxicillin 250mg)..."
                value={form.medications}
                onChange={handleChange}
                rows={3}
              />
              <button 
                type="button" 
                className="rx-btn" 
                style={{ marginTop: "10px", background: "linear-gradient(135deg, #6c63ff, #a78bfa)", border: "none", padding: "10px", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                onClick={handleCheckInteractions}
                disabled={checkingClash}
              >
                {checkingClash ? "⏳ Analyzing Pharmacology..." : "🤖 Check Drug Interactions"}
              </button>

              {clashResult && (
                <div style={{
                  marginTop: "12px", padding: "14px", borderRadius: "8px", fontWeight: "600", fontSize: "0.95rem",
                  background: clashResult.status === "SAFE" ? "rgba(67, 233, 123, 0.15)" :
                              clashResult.status === "WARNING" ? "rgba(247, 151, 30, 0.15)" : "rgba(233, 108, 108, 0.15)",
                  color: clashResult.status === "SAFE" ? "#34d399" :
                         clashResult.status === "WARNING" ? "#fbbf24" : "#f87171",
                  border: `1px solid ${clashResult.status === "SAFE" ? "rgba(67, 233, 123, 0.4)" : clashResult.status === "WARNING" ? "rgba(247, 151, 30, 0.4)" : "rgba(233, 108, 108, 0.4)"}`
                }}>
                  {clashResult.status === "SAFE" && "✅ SAFE: "}
                  {clashResult.status === "WARNING" && "⚠️ WARNING: "}
                  {clashResult.status === "CRITICAL" && "🔴 CRITICAL CLASH: "}
                  {clashResult.msg}
                </div>
              )}
            </div>

            <div className="rx-field full">
              <label>Dosage &amp; Instructions</label>
              <textarea
                name="dosageInstructions"
                placeholder="e.g. Paracetamol — 1 tablet twice daily after meals for 5 days..."
                value={form.dosageInstructions}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="rx-field full">
              <label>Additional Notes</label>
              <textarea
                name="additionalNotes"
                placeholder="Follow-up date, dietary advice, rest period..."
                value={form.additionalNotes}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>

          {error && (
            <div className="rx-success" style={{ background: "rgba(233,108,108,0.15)", borderColor: "rgba(233,108,108,0.4)", color: "#e96c6c" }}>
              ❌ {error}
            </div>
          )}
          {success && <div className="rx-success">{success}</div>}

          <div className="rx-actions">
            <button type="button" className="rx-btn secondary" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
            <button 
              type="submit" 
              className="rx-btn primary" 
              disabled={submitting || clashResult?.status === "CRITICAL"}
              title={clashResult?.status === "CRITICAL" ? "Cannot save while a Critical Clash exists. Please alter medications." : ""}
            >
              {submitting ? "Saving…" : "💾 Save Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
