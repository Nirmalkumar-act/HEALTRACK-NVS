package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Booking;

/**
 * Notification service — sends booking confirmation emails to patients.
 * If no email is provided, silently skips without any error.
 */
public interface NotificationService {

    /**
     * Send a booking confirmation email to the patient.
     *
     * @param booking       The saved booking object with all patient details.
     * @param queuePosition How many patients are waiting before this patient.
     */
    void sendBookingConfirmation(Booking booking, int queuePosition);
}
