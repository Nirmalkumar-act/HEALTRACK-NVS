package com.healtrack.hmsbackend.repository;

import com.healtrack.hmsbackend.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientNameContainingIgnoreCase(String patientName);
    List<Prescription> findByDoctorName(String doctorName);
}
