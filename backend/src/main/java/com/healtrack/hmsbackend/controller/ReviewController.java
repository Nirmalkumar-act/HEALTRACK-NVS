package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.DoctorReview;
import com.healtrack.hmsbackend.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private static final Logger log = LoggerFactory.getLogger(ReviewController.class);
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    // 🔹 Patient submits a review
    @PostMapping
    public ResponseEntity<?> create(@RequestBody DoctorReview review) {
        if (review.getDoctorName() == null || review.getDoctorName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Doctor name is required"));
        }
        if (review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
        }
        DoctorReview saved = service.save(review);
        log.info("REVIEW | created | doctor={} | rating={}", saved.getDoctorName(), saved.getRating());
        return ResponseEntity.ok(saved);
    }

    // 🔹 Get all reviews
    @GetMapping
    public List<DoctorReview> getAll() {
        return service.getAll();
    }

    // 🔹 Get reviews + stats by doctor name
    @GetMapping("/doctor")
    public Map<String, Object> getByDoctor(@RequestParam String name) {
        return service.getDoctorStats(name);
    }
}
