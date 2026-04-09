package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.DoctorReview;
import java.util.List;
import java.util.Map;

public interface ReviewService {
    DoctorReview save(DoctorReview review);
    List<DoctorReview> getAll();
    List<DoctorReview> getByDoctor(String doctorName);
    Map<String, Object> getDoctorStats(String doctorName);
}
