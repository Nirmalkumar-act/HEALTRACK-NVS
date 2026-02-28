// src/context/BookingContext.jsx
import React, { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState({}); // { "Dr. A": true, "Dr. B": false }

  // ================= ADD BOOKING =================
  const addBooking = async (booking) => {
    try {
      // ✅ Ensure date & time exist
      const date = booking.date || new Date().toLocaleDateString();
      const time = booking.time || new Date().toLocaleTimeString();

      // ✅ Duplicate check (same patient, same day)
      const exists = bookings.some(
        (b) => b.name === booking.name && b.date === date
      );

      if (exists) {
        alert("⚠️ This patient is already registered today!");
        return;
      }

      const res = await fetch("http://localhost:8081/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: booking.token,
          scanType: booking.scanType,
          hospital: booking.hospital,
          name: booking.name,
          age: booking.age,
          gender: booking.gender,
          weight: booking.weight,
          location: booking.location,
          condition: booking.condition,
          doctor: booking.doctor,
          notes: booking.notes,
          bookingDate: date,
          bookingTime: time,
        }),
      });

      if (!res.ok) throw new Error("Failed to save booking");

      const saved = await res.json();

      const doctorname = saved.doctorname || saved.doctor || "";

      // ✅ Save with date & time locally too
      setBookings((prev) => [
        ...prev,
        { ...saved, date, time, doctorname },
      ]);
    } catch (err) {
      console.error("Booking save failed", err);
      throw err;
    }
  };

  // ================= QUEUE CONTROLS =================
  const nextPatient = () => {
    if (bookings.length > 0) {
      setBookings((prev) => prev.slice(1));
    }
  };

  const clearQueue = () => setBookings([]);

  const getQueueStatus = (token) => {
    const index = bookings.findIndex((b) => b.token === token);
    if (index === -1) return "❌ Not in queue";
    if (index === 0) return "✅ Now Serving";
    return `⏳ Waiting... ${index} ahead`;
  };

  // ================= DOCTOR AVAILABILITY =================
  const setDoctorAvailability = (doctorName, available) => {
    setDoctors((prev) => ({ ...prev, [doctorName]: available }));
  };

  const isDoctorAvailable = (doctorName) => doctors[doctorName] ?? true;

  // ================= UPDATE DOCTOR NAME =================
  const updateDoctorName = (oldName, newName) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.doctor === oldName || b.doctorname === oldName
          ? { ...b, doctor: newName, doctorname: newName }
          : b
      )
    );

    setDoctors((prev) => {
      const updated = { ...prev };
      if (oldName in updated) {
        updated[newName] = updated[oldName];
        delete updated[oldName];
      }
      return updated;
    });
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        setBookings,
        addBooking,
        nextPatient,
        clearQueue,
        getQueueStatus,
        doctors,
        setDoctorAvailability,
        isDoctorAvailable,
        updateDoctorName,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
