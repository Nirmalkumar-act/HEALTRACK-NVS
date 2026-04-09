package com.healtrack.hmsbackend.repository;

import com.healtrack.hmsbackend.model.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<DoctorReview, Long> {
    List<DoctorReview> findByDoctorNameContainingIgnoreCase(String doctorName);
}
