package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Booking;
import java.util.List;

public interface BookingService {
    Booking saveBooking(Booking booking);
    List<Booking> getAllBookings();
}
