import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import "../styles/Booking.css";

export default function Booking() {
  const nav = useNavigate();
  const { addBooking, getQueueStatus, bookings } = useBooking();

  const methods = [
    { type: "AADHAAR", label: "GET TOKEN", icon: "🆔" },
    { type: "QR", label: "QR Code", icon: "📱" },
    { type: "GANTRADE", label: "Gantrade Card", icon: "💳" },
    { type: "ONLINE", label: "Online Booking", icon: "🌐" },
  ];

  const [scanType, setScanType] = useState("");
  const [step, setStep] = useState(1);
  const [newToken, setNewToken] = useState(null);

  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [condition, setCondition] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");

  // 🔊 Voice
  const [speechText, setSpeechText] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  /* ================= SAFE VOICE START ================= */
  const startVoiceFill = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // works for Tamil + English mixed
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSpeechText(text);
      handleVoiceFillSmart(text);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  /* ================= SAFE VOICE PARSER ================= */
  const handleVoiceFillSmart = (speech) => {
    const text = speech.toLowerCase();

    // NAME
    if (!name) {
      const guess = speech.split(/[,.]/)[0];
      if (guess.length < 30) setName(guess.trim());
    }

    // AGE
    if (!age) {
      const m = text.match(/\b([1-9][0-9]|1[01][0-9]|120)\b/);
      if (m) setAge(m[1]);
    }

    // GENDER
    if (!gender) {
      if (text.includes("male") || text.includes("ஆண்")) setGender("Male");
      if (text.includes("female") || text.includes("பெண்")) setGender("Female");
    }

    // WEIGHT
    if (!weight) {
      const nums = text.match(/\b\d+\b/g);
      if (nums) {
        const w = nums.find((n) => n > 30 && n < 200);
        if (w) setWeight(w);
      }
    }

    // LOCATION
    if (!location) {
      if (text.includes("chennai")) setLocation("Chennai");
      if (text.includes("madurai")) setLocation("Madurai");
      if (text.includes("coimbatore")) setLocation("Coimbatore");
    }

    // CONDITION
    if (!condition) {
      if (text.includes("fever") || text.includes("காய்ச்சல்"))
        setCondition("Fever");
      if (text.includes("pain") || text.includes("வலி"))
        setCondition("Pain");
    }

    // DOCTOR
    if (!doctor && text.includes("doctor")) {
      const d = speech.split("doctor")[1];
      if (d) setDoctor(d.trim());
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !age || !gender || !location || !doctor) {
      alert("Please fill required fields");
      return;
    }

    const token = Math.floor(1000 + Math.random() * 9000);

    addBooking({
      token,
      scanType,
      hospital,
      name,
      age,
      gender,
      weight,
      location,
      condition,
      doctor,
      notes,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    });

    setNewToken(token);
    setStep(3);
  };


  return (
    <div className="booking-wrapper">
      <div className="booking-page">
        <h1 className="booking-title">📑 Patient Booking System</h1>
        <p className="muted">
          Choose an identification method → Fill details → Get Token.
        </p>

{/* 🔊 ONLY BUTTON CHANGE */}
        <button className="btn primary" onClick={startVoiceFill}>
          🎤 Speak
        </button>

        <p className="speech-preview">{speechText}</p>

        {/* Select method */}
        <label className="form-label">Select Identification Method</label>
        <div className="scanner-options">
          {methods.map((m) => (
            <button
              key={m.type}
              type="button"
              className={`scanner-btn ${scanType === m.type ? "active" : ""}`}
              onClick={() => {
                setScanType(m.type);
                setStep(1);
                if (m.type === "QR") nav("/qrscanner");
                if (m.type === "GANTRADE") nav("/gantrade");
              }}
            >
              <span className="scanner-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Aadhaar Booking Form */}
        {scanType === "AADHAAR" && (
          <form className="card form" onSubmit={handleSubmit}>
            <h2 className="step-title">🆔 GET TOKEN</h2>

            <div className="input-group">
              <span className="input-icon">🧑</span>
              <input
                type="text"
                placeholder="Patient Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid2">
              <div className="input-group">
                <span className="input-icon">🎂</span>
                <input
                  type="number"
                  placeholder="Age"
                  min="1"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="input-group">
                <span className="input-icon">⚧️</span>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male ♂</option>
                  <option value="Female">Female ♀</option>
                  <option value="Other">Other ⚧</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <span className="input-icon">⚖️</span>
              <input
                type="number"
                placeholder="Weight (kg)"
                min="1"
                max="500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">📍</span>
              <input
                type="text"
                placeholder="Current Location"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">❤️</span>
              <input
                type="text"
                placeholder="Health Condition / Symptoms"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">👨‍⚕️</span>
              <input
                type="text"
                placeholder="Doctor Name"
                required
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
              />
            </div>

            <textarea
              className="additional-notes"
              placeholder="Additional notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="form-footer">
              <button
                className="btn secondary"
                type="button"
                onClick={() => nav("/")}
              >
                ← Cancel
              </button>
              <button className="btn primary pulse" type="submit">
                Submit → Get Token
              </button>
            </div>
          </form>
        )}

        {/* Online Booking & Confirmation Steps */}
        {scanType === "ONLINE" && (
          <>
            {step === 1 && (
              <form
                className="card form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(2);
                }}
              >
                <h2 className="step-title">🏥 Choose Hospital & Location</h2>
                <div className="input-group">
                  <span className="input-icon">🏥</span>
                  <input
                    type="text"
                    placeholder="Hospital Name"
                    required
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    placeholder="Enter Location"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-footer">
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => nav("/")}
                  >
                    ← Cancel
                  </button>
                  <button className="btn primary pulse" type="submit">
                    Next → Patient Details
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="card form" onSubmit={handleSubmit}>
                <h2 className="step-title">📝 Patient Details</h2>

                <div className="input-group">
                  <span className="input-icon">🧑</span>
                  <input
                    type="text"
                    placeholder="Patient Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid2">
                  <div className="input-group">
                    <span className="input-icon">🎂</span>
                    <input
                      type="number"
                      placeholder="Age"
                      min="1"
                      max="120"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <span className="input-icon">⚧️</span>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male ♂</option>
                      <option value="Female">Female ♀</option>
                      <option value="Other">Other ⚧</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <span className="input-icon">⚖️</span>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    min="1"
                    max="500"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon">👨‍⚕️</span>
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    required
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon">❤️</span>
                  <input
                    type="text"
                    placeholder="Problem / Symptoms"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  />
                </div>

                <textarea
                  className="additional-notes"
                  placeholder="Additional Information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <div className="form-footer">
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button className="btn primary pulse" type="submit">
                    Book → Get Token
                  </button>
                </div>
              </form>
            )}

            {step === 3 && newToken && (
              <div className="card confirmation">
                <h2>✅ Booking Confirmed</h2>
                <p>
                  <b>Token:</b> {newToken}
                </p>
                <p>
                  <b>Patient:</b> {name} ({age} yrs, {gender})
                </p>
                <p>
                  <b>Doctor:</b> {doctor}
                </p>
                <p>
                  <b>Hospital:</b> {hospital}
                </p>
                <p>
                  <b>Booking Time:</b> {new Date().toLocaleTimeString()}
                </p>
                <hr />
                <h3>⏳ Live Queue Status</h3>
                <p className="queue-status">{getQueueStatus(newToken)}</p>
                <p>Total Patients in Queue: {bookings.length}</p>
                <div className="form-footer">
                  <button
                    className="btn primary"
                    onClick={() => nav("/waiting")}
                  >
                    Go to Waiting Room
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() => nav("/dashboard")}
                  >
                    Doctor Dashboard
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
