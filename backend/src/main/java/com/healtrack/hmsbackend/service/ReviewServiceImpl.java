package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.DoctorReview;
import com.healtrack.hmsbackend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository repository;

    public ReviewServiceImpl(ReviewRepository repository) {
        this.repository = repository;
    }

    @Override
    public DoctorReview save(DoctorReview review) {
        if (review == null) throw new IllegalArgumentException("Review cannot be null");
        return repository.save(review);
    }

    @Override
    public List<DoctorReview> getAll() {
        return repository.findAll();
    }

    @Override
    public List<DoctorReview> getByDoctor(String doctorName) {
        if (doctorName == null || doctorName.isBlank()) return List.of();
        return repository.findByDoctorNameContainingIgnoreCase(doctorName.trim());
    }

    @Override
    public Map<String, Object> getDoctorStats(String doctorName) {
        List<DoctorReview> reviews = getByDoctor(doctorName);
        Map<String, Object> stats = new HashMap<>();
        stats.put("doctorName", doctorName);
        stats.put("totalReviews", reviews.size());
        double avg = reviews.stream()
                .mapToInt(DoctorReview::getRating)
                .average()
                .orElse(0.0);
        stats.put("averageRating", Math.round(avg * 10.0) / 10.0);
        stats.put("reviews", reviews);
        return stats;
    }
}
