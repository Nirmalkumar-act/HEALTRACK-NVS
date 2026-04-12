package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Booking;
import com.healtrack.hmsbackend.repository.BookingRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repository;

    public BookingServiceImpl(BookingRepository repository) {
        this.repository = repository;
    }

    @Override
    public Booking saveBooking(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }
        return repository.save(booking);
    }

    @Override
    public List<Booking> getAllBookings() {
        return repository.findAll();
    }

    @Override
    public List<Booking> getBookingsByDate(String date) {
        if (date == null || date.isBlank()) return repository.findAll();
        return repository.findByBookingDate(date);
    }

    @Override
    public Optional<Booking> updateStatus(@NonNull Long id, Booking.BookingStatus status) {
        return repository.findById(id).map(booking -> {
            booking.setStatus(status);
            return repository.save(booking);
        });
    }
}
