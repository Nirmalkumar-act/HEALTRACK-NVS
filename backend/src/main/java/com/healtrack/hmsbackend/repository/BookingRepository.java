package com.healtrack.hmsbackend.repository;

import com.healtrack.hmsbackend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
