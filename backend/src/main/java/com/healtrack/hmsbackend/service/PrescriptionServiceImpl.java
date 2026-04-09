package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Prescription;
import com.healtrack.hmsbackend.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository repository;

    public PrescriptionServiceImpl(PrescriptionRepository repository) {
        this.repository = repository;
    }

    @Override
    public Prescription save(Prescription prescription) {
        if (prescription == null) throw new IllegalArgumentException("Prescription cannot be null");
        return repository.save(prescription);
    }

    @Override
    public List<Prescription> getAll() {
        return repository.findAll();
    }

    @Override
    public List<Prescription> getByPatientName(String name) {
        if (name == null || name.isBlank()) return List.of();
        return repository.findByPatientNameContainingIgnoreCase(name.trim());
    }

    @Override
    public List<Prescription> getByDoctorName(String doctorName) {
        if (doctorName == null || doctorName.isBlank()) return List.of();
        return repository.findByDoctorName(doctorName.trim());
    }
}
