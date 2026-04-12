package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Booking;
import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

public interface BookingService {
    Booking saveBooking(Booking booking);
    List<Booking> getAllBookings();
    List<Booking> getBookingsByDate(String date);
    Optional<Booking> updateStatus(@NonNull Long id, Booking.BookingStatus status);
}
