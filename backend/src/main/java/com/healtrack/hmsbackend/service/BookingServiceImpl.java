package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Booking;
import com.healtrack.hmsbackend.repository.BookingRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repository;
    private final NotificationService notificationService;

    public BookingServiceImpl(BookingRepository repository,
                              NotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    @Override
    public Booking saveBooking(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }

        // Save first — booking must succeed regardless of email
        Booking saved = repository.save(booking);

        // Count how many patients are already WAITING today (queue position)
        String today = LocalDate.now().toString(); // e.g. "2026-04-20"
        try {
            List<Booking> todayWaiting = repository.findByBookingDate(today).stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.WAITING
                              && !b.getId().equals(saved.getId()))
                    .toList();
            int queuePosition = todayWaiting.size();

            // Send email asynchronously — never blocks the API response
            notificationService.sendBookingConfirmation(saved, queuePosition);

        } catch (Exception e) {
            // If queue counting fails, still send with position 0
            notificationService.sendBookingConfirmation(saved, 0);
        }

        return saved;
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

    @Override
    public List<Booking> getPatientHistory(String name, String phone) {
        if (name != null && !name.isBlank() && phone != null && !phone.isBlank()) {
            return repository.findByNameIgnoreCaseAndPhone(name, phone);
        } else if (name != null && !name.isBlank()) {
            return repository.findByNameIgnoreCase(name);
        } else if (phone != null && !phone.isBlank()) {
            return repository.findByPhone(phone);
        }
        return List.of();
    }
}

