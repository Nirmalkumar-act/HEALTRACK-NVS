package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.Booking;
import com.healtrack.hmsbackend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    // 🔹 Save booking (Frontend → Backend)
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return service.saveBooking(booking);
    }

    // 🔹 Get bookings — optionally filtered by date (?date=2026-04-10)
    @GetMapping
    public List<Booking> getBookings(@RequestParam(required = false) String date) {
        if (date != null && !date.isBlank()) {
            return service.getBookingsByDate(date);
        }
        return service.getAllBookings();
    }

    // 🔹 Get patient history
    @GetMapping("/history")
    public List<Booking> getHistory(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone) {
        return service.getPatientHistory(name, phone);
    }

    // 🔹 Update booking status (Doctor Dashboard)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        try {
            Booking.BookingStatus status = Booking.BookingStatus.valueOf(body.get("status").toUpperCase());
            return service.updateStatus(id, status)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        }
    }
}
