package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.Booking;
import com.healtrack.hmsbackend.model.Prescription;
import com.healtrack.hmsbackend.repository.BookingRepository;
import com.healtrack.hmsbackend.repository.PrescriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * New controller: GET /api/patient-history/full
 * Returns all bookings + prescriptions for a patient (name + phone).
 * Completely separate from BookingController — zero impact on existing code.
 */
@RestController
@RequestMapping("/api/patient-history")
@CrossOrigin(origins = "*")
public class PatientHistoryController {

    private final BookingRepository bookingRepo;
    private final PrescriptionRepository prescriptionRepo;

    public PatientHistoryController(BookingRepository bookingRepo,
                                    PrescriptionRepository prescriptionRepo) {
        this.bookingRepo = bookingRepo;
        this.prescriptionRepo = prescriptionRepo;
    }

    /**
     * GET /api/patient-history/full?name=John Doe&phone=9876543210
     * Returns: { bookings: [...], prescriptions: [...], patientName: "...", phone: "..." }
     */
    @GetMapping("/full")
    public ResponseEntity<Map<String, Object>> getFullHistory(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone) {

        if ((name == null || name.isBlank()) && (phone == null || phone.isBlank())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please provide at least a patient name or phone number."));
        }

        List<Booking> bookings;
        if (name != null && !name.isBlank() && phone != null && !phone.isBlank()) {
            // Try exact+phone first, then fall back to partial match+phone
            bookings = bookingRepo.findByNameContainingIgnoreCaseAndPhone(name.trim(), phone.trim());
            if (bookings.isEmpty()) {
                // Phone might not be stored — fall back to name only
                bookings = bookingRepo.findByNameContainingIgnoreCase(name.trim());
            }
        } else if (phone != null && !phone.isBlank()) {
            bookings = bookingRepo.findByPhone(phone.trim());
        } else {
            // Name-only search: use LIKE/containing to handle case variants
            bookings = bookingRepo.findByNameContainingIgnoreCase(name.trim());
        }

        // Fetch prescriptions by patient name (case-insensitive partial match)
        List<Prescription> prescriptions = (name != null && !name.isBlank())
                ? prescriptionRepo.findByPatientNameContainingIgnoreCase(name.trim())
                : List.of();

        Map<String, Object> response = new HashMap<>();
        response.put("patientName", name != null ? name.trim() : "");
        response.put("phone", phone != null ? phone.trim() : "");
        response.put("bookings", bookings);
        response.put("prescriptions", prescriptions);
        response.put("totalVisits", bookings.size());
        response.put("totalPrescriptions", prescriptions.size());

        return ResponseEntity.ok(response);
    }
}
