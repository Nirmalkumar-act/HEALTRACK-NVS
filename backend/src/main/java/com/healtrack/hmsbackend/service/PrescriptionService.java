package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Prescription;
import java.util.List;

public interface PrescriptionService {
    Prescription save(Prescription prescription);
    List<Prescription> getAll();
    List<Prescription> getByPatientName(String name);
    List<Prescription> getByDoctorName(String doctorName);
}
