// src/pages/DoctorDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import api from "../api/api";
import "../styles/DoctorDashboard.css";

export default function DoctorDashboard() {
  const { bookings, setBookings, doctors, setDoctorAvailability } = useBooking();
  const [search, setSearch] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings");
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, [setBookings]);

  const genderIcon = (gender) => {
    if (gender === "Male") return "♂";
    if (gender === "Female") return "♀";
    if (gender === "Other") return "⚧";
    return "❓";
  };

  const doctorVisits = useMemo(() => {
    const counts = {};
    bookings.forEach((b) => {
      counts[b.doctor] = (counts[b.doctor] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const allDoctors = [...new Set(bookings.map((b) => b.doctor))];

  const filteredBookings = bookings.filter((b) => {
    const matchesName = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesDoctor = filterDoctor ? b.doctor === filterDoctor : true;
    return matchesName && matchesDoctor;
  });



  return (
    <div className="doctor-dashboard">
      <h1>👨‍⚕️ Doctor Dashboard</h1>
      <p className="clock">🕒 {time.toLocaleDateString()} | {time.toLocaleTimeString()}</p>

      {/* Doctors Availability */}
      <div className="doctor-availability">
        <h2>👩‍⚕️ Doctors Availability</h2>
        {allDoctors.map((doc) => (
          <div key={doc} className="doctor-item">
            <span>{doc}</span>
            {/* Available Button */}
            <button
              className={`btn primary`}
              onClick={() => setDoctorAvailability(doc, true)}
              disabled={doctors[doc] === true}
            >
              Available
            </button>
            {/* Not Available Button */}
            <button
              className={`btn danger`}
              onClick={() => setDoctorAvailability(doc, false)}
              disabled={doctors[doc] === false}
            >
              Not Available
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="doctor-summary">
        <div className="doctor-card">
          <h3>Total Patients</h3>
          <p>{bookings.length}</p>
        </div>
        <div className="doctor-card">
          <h3>Now Serving</h3>
          <p>{bookings.length > 0 ? bookings[0].name : "None"}</p>
        </div>
        <div className="doctor-card">
          <h3>Doctors Active</h3>
          <p>{allDoctors.length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="🔍 Search patient by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
          <option value="">All Doctors</option>
          {allDoctors.map((doc) => (
            <option key={doc} value={doc}>{doc}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredBookings.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Condition</th>
              <th>Doctor</th>
              <th>Booking Time</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b, idx) => (
              <tr key={b.token} className={idx === 0 ? "active-row" : ""}>
                <td>{b.token}</td>
                <td>{b.name}</td>
                <td>{b.age}</td>
                <td className={`gender ${b.gender?.toLowerCase()}`}>
                  {genderIcon(b.gender)} {b.gender}
                </td>
                <td>{b.condition || "N/A"}</td>
                <td className={doctors[b.doctor] === false ? "not-available" : ""}>
                  {b.doctor} {doctors[b.doctor] === false && "(Not Available)"}
                </td>
                <td>{b.time}</td>
                <td>{b.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
