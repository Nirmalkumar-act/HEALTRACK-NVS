package com.healtrack.hmsbackend.service;

public interface AIService {

    String getMedicalResponse(String userMessage);
    String checkDrugInteractions(String patientName, String newMedications);

}