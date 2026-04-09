// src/context/BookingContext.jsx
import React, { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [doctors,  setDoctors]  = useState({});

  // ── Add Booking (saves to backend + local state) ──────────────────────────
  const addBooking = async (booking) => {
    const date = booking.bookingDate || booking.date || new Date().toLocaleDateString();
    const time = booking.bookingTime || booking.time || new Date().toLocaleTimeString();

    // Duplicate check (same patient, same day)
    const exists = bookings.some(b => b.name === booking.name && (b.bookingDate || b.date) === date);
    if (exists) {
      alert("⚠️ This patient is already registered today!");
      return;
    }

    const res = await fetch("http://localhost:8081/api/bookings", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        token:       booking.token,
        scanType:    booking.scanType,
        hospital:    booking.hospital,
        name:        booking.name,
        age:         booking.age,
        gender:      booking.gender,
        weight:      booking.weight,
        location:    booking.location,
        condition:   booking.condition,
        doctor:      booking.doctor,
        notes:       booking.notes,
        bookingDate: date,
        bookingTime: time,
      }),
    });

    if (!res.ok) throw new Error("Failed to save booking");

    const saved = await res.json();
    setBookings(prev => [...prev, { ...saved, date, time, bookingDate: date, bookingTime: time }]);
  };

  // ── Queue Controls ─────────────────────────────────────────────────────────
  // nextPatient removes from FRONTEND display only — backend keeps the record
  const nextPatient = () => setBookings(prev => prev.slice(1));

  // clearQueue removes from FRONTEND display only — backend keeps all records
  const clearQueue = () => setBookings([]);

  const getQueueStatus = (token) => {
    const index = bookings.findIndex(b => b.token === token);
    if (index === -1) return "❌ Not in queue";
    if (index === 0)  return "✅ Now Serving";
    return `⏳ Waiting — ${index} patient${index === 1 ? "" : "s"} ahead`;
  };

  // ── Doctor Availability ────────────────────────────────────────────────────
  const setDoctorAvailability = (doctorName, available) =>
    setDoctors(prev => ({ ...prev, [doctorName]: available }));

  const isDoctorAvailable = (doctorName) => doctors[doctorName] ?? true;

  const updateDoctorName = (oldName, newName) => {
    setBookings(prev =>
      prev.map(b =>
        b.doctor === oldName ? { ...b, doctor: newName } : b
      )
    );
    setDoctors(prev => {
      const updated = { ...prev };
      if (oldName in updated) { updated[newName] = updated[oldName]; delete updated[oldName]; }
      return updated;
    });
  };

  return (
    <BookingContext.Provider value={{
      bookings, setBookings,
      addBooking, nextPatient, clearQueue, getQueueStatus,
      doctors, setDoctorAvailability, isDoctorAvailable, updateDoctorName,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
