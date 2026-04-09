package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.Prescription;
import com.healtrack.hmsbackend.service.PrescriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private static final Logger log = LoggerFactory.getLogger(PrescriptionController.class);
    private final PrescriptionService service;

    public PrescriptionController(PrescriptionService service) {
        this.service = service;
    }

    // 🔹 Doctor creates a prescription
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Prescription prescription) {
        if (prescription.getPatientName() == null || prescription.getPatientName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Patient name is required"));
        }
        if (prescription.getDiagnosis() == null || prescription.getDiagnosis().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Diagnosis is required"));
        }
        Prescription saved = service.save(prescription);
        log.info("PRESCRIPTION | created | patient={} | doctor={}", 
                 saved.getPatientName(), saved.getDoctorName());
        return ResponseEntity.ok(saved);
    }

    // 🔹 Get all prescriptions (Management)
    @GetMapping
    public List<Prescription> getAll() {
        return service.getAll();
    }

    // 🔹 Get prescriptions by patient name (Patient view)
    @GetMapping("/patient")
    public List<Prescription> getByPatient(@RequestParam String name) {
        return service.getByPatientName(name);
    }

    // 🔹 Get prescriptions by doctor name (Doctor view)
    @GetMapping("/doctor")
    public List<Prescription> getByDoctor(@RequestParam String name) {
        return service.getByDoctorName(name);
    }
}
