import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { AuthContext } from "../context/AuthContext";
import "../styles/Booking.css";

export default function Booking() {

  const nav = useNavigate();
  const { addBooking, getQueueStatus, bookings } = useBooking();

  // ✅ FIRST define user & role
  const { user } = useContext(AuthContext);
  const role = user?.role;

  // Prevent Doctors from accessing this page completely
  useEffect(() => {
    if (role === "Doctor") {
      nav("/dashboard", { replace: true });
    }
  }, [role, nav]);

  // ✅ THEN define methods (after role exists)
  // Role-based booking methods:
  // User       → Online Booking only
  // Doctor     → Online + Get Token
  // Management → All 4 options
  const methods = [
    { type: "ONLINE", label: "Online Booking", icon: "🌐" },
    ...(role === "Doctor" || role === "Management"
      ? [{ type: "AADHAAR", label: "Get Token", icon: "🆔" }]
      : []),
    ...(role === "Management"
      ? [
        { type: "QR", label: "QR Code", icon: "📱" },
        { type: "GANTRADE", label: "Gantrade Card", icon: "💳" },
      ]
      : []),
  ];

  const [scanType, setScanType] = useState("");
  const [step, setStep] = useState(1);
  const [newToken, setNewToken] = useState(null);

  // Booking details
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [condition, setCondition] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Speech recognition
  const [speechText, setSpeechText] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setSpeechText(transcript);
      handleVoiceFill(transcript);
    };

    recognition.onerror = (event) => console.error(event.error);

    if (listening) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [listening]);

  const handleVoiceFill = (text) => {
    const cleaned = text.toLowerCase().replace(/[.,]/g, "");

    // Name
    const nameMatch =
      cleaned.match(/my name is (.+?)(?: age| gender| location| doctor|$)/) ||
      cleaned.match(/name (?:is|as) (.+?)(?: age| gender| location| doctor|$)/);
    if (nameMatch) setName(nameMatch[1].trim());

    // Age
    const ageMatch = cleaned.match(/age (?:is|of)? (\d{1,3})/);
    if (ageMatch) setAge(ageMatch[1]);

    // Gender
    if (cleaned.includes("female")) setGender("Female");
    else if (cleaned.includes("male")) setGender("Male");
    else if (cleaned.includes("other")) setGender("Other");

    // Weight
    const weightMatch = cleaned.match(/weight (?:is|of)? (\d{1,3})/);
    if (weightMatch) setWeight(weightMatch[1]);

    // Location
    const locationMatch =
      cleaned.match(/location (?:is|at)? (.+?)(?: problem| condition| doctor|$)/) ||
      cleaned.match(/i am from (.+?)(?: problem| condition| doctor|$)/);
    if (locationMatch) setLocation(locationMatch[1].trim());

    // Condition / Problem
    const condMatch =
      cleaned.match(/problem (?:is|of)? (.+?)(?: doctor|$)/) ||
      cleaned.match(/condition (?:is|of)? (.+?)(?: doctor|$)/);
    if (condMatch) setCondition(condMatch[1].trim());

    // Doctor
    const docMatch =
      cleaned.match(/doctor (?:is|name is)? (.+?)(?: location| problem|$)/);
    if (docMatch) setDoctor(docMatch[1].trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !age || !gender || !location.trim() || !doctor.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const token = Math.floor(1000 + Math.random() * 9000);

    const bookingData = {
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
      phone,
      email,
      bookingDate: bookingDate || new Date().toISOString().slice(0, 10),
      bookingTime: bookingTime || new Date().toLocaleTimeString('en-US', { hour12: true }),
      date: bookingDate || new Date().toISOString().slice(0, 10),
      time: bookingTime || new Date().toLocaleTimeString('en-US', { hour12: true }),
    };

    try {
      await addBooking(bookingData); // ✅ CONTEXT CALL
      setNewToken(token);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Booking failed. Try again.");
    };


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

        {/* Voice recognition toggle */}
        <button
          className={`btn ${listening ? "secondary" : "primary"}`}
          onClick={() => setListening(!listening)}
        >
          {listening ? "🎙️ Stop Listening" : "🎤 Start Voice Fill"}
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

            <div className="grid2">
              <div className="input-group">
                <span className="input-icon">📞</span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Email ID (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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

                {/* 📅 Date & Time Picker */}
                <div className="grid2">
                  <div className="input-group">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-icon">🕐</span>
                    <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required>
                      <option value="">Select Time Slot</option>
                      {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
                        "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
                        "04:00 PM", "04:30 PM", "05:00 PM"].map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                  </div>
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
                  <b>Booking Time:</b> {bookingTime || new Date().toLocaleTimeString()}
                </p>
                <p>
                  <b>📅 Appointment Date:</b> {bookingDate || new Date().toLocaleDateString()}
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