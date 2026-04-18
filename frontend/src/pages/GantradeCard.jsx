import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import "../styles/GantradeCard.css";

export default function GantradeCard() {
  const navigate = useNavigate();
  const { bookings } = useBooking();

  // Default patient (from booking if available, otherwise blank)
  const defaultPatient = bookings[0] || {};
  const [form, setForm] = useState({
    name: defaultPatient.name || "",
    age: defaultPatient.age || "",
    gender: defaultPatient.gender || "",
    bloodGroup: "",
    phone: defaultPatient.phone || "",
    email: "",
    address: "",
    cardNo: "GNT-" + Math.floor(100000 + Math.random() * 900000),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (bookings.length > 0) {
      const patient = bookings[0];
      setForm((prev) => ({
        ...prev,
        name: patient.name || prev.name,
        age: patient.age || prev.age,
        phone: patient.phone || prev.phone,
      }));
    }
  }, [bookings]);

  // The pure Identity payload
  const qrData = JSON.stringify({
    name: form.name,
    age: form.age,
    gender: form.gender,
    bloodGroup: form.bloodGroup,
    phone: form.phone,
    email: form.email,
    address: form.address,
    cardNo: form.cardNo,
  });

  const handleSave = () => {
    alert("Patient ID Card generated successfully!");
  };

  return (
    <div className="gantrade-wrapper">
      <h1 className="gantrade-title">🪪 Patient Health ID Card</h1>

      <div className="gantrade-container">
        {/* Left: Editable Form */}
        <div className="gantrade-form">
          <h3>Enter Patient Identity Details</h3>
          
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label>Age</label>
              <input name="age" value={form.age} onChange={handleChange} placeholder="Age" />
            </div>
            <div>
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <label>Blood Group</label>
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} style={{ width: "100%", marginBottom: "14px"}}>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
          
          <label>Email ID (Optional)</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" />

          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Home Address" />

          <label>Card Number (Auto)</label>
          <input name="cardNo" value={form.cardNo} readOnly style={{ background: "#f1f5f9" }} />

          <button className="btn primary" onClick={handleSave} style={{ width: "100%", marginTop: "10px" }}>
            💾 Generate ID Card
          </button>
        </div>

        {/* Right: Gantrade Card Preview */}
        <div className="gantrade-card">
          <div className="gantrade-left">
            <img
              src="https://ociacc.com/wp-content/uploads/2019/03/blank-profile-picture-973460_1280-1030x1030.png"
              alt="Patient"
              className="patient-photo"
            />
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`}
              alt="QR Code"
              className="qr-code"
            />
          </div>

          <div className="gantrade-right">
            <h2>{form.name || "Patient Name"}</h2>
            <p style={{ color: "#e11d48", fontWeight: "bold", fontSize: "1.1rem" }}>
              🩸 Blood Group: {form.bloodGroup || "—"}
            </p>
            <p><b>Age / Gender:</b> {form.age || "—"} yrs, {form.gender || "—"}</p>
            <p><b>Phone:</b> {form.phone || "—"}</p>
            <p><b>Email:</b> {form.email || "—"}</p>
            <p><b>Address:</b> {form.address || "—"}</p>
            <p><b>Card No:</b> {form.cardNo}</p>

            <div className="gantrade-actions" style={{ marginTop: "20px" }}>
              <button className="btn primary" onClick={() => navigate("/qrscanner")}>
                📷 Scan Check-in
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="btn back" onClick={() => navigate("/booking")}>
        ⬅ Back to Connect
      </button>
    </div>
  );
}
