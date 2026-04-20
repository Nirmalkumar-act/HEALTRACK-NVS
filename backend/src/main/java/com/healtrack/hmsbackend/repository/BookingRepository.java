package com.healtrack.hmsbackend.repository;

import com.healtrack.hmsbackend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBookingDate(String bookingDate);
    List<Booking> findByNameIgnoreCase(String name);
    List<Booking> findByNameContainingIgnoreCase(String name);
    List<Booking> findByPhone(String phone);
    List<Booking> findByNameIgnoreCaseAndPhone(String name, String phone);
    List<Booking> findByNameContainingIgnoreCaseAndPhone(String name, String phone);
}
