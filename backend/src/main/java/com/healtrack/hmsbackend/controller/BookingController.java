package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.Booking;
import com.healtrack.hmsbackend.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
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

    // 🔹 Get all bookings
    @GetMapping
    public List<Booking> getBookings() {
        return service.getAllBookings();
    }
}
