package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public NotificationServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void sendBookingConfirmation(Booking booking, int queuePosition) {
        String email = booking.getEmail();

        // Skip silently if no email provided — booking is NOT affected
        if (email == null || email.isBlank()) {
            log.info("NOTIFICATION | Skipped — no email for patient: {}", booking.getName());
            return;
        }

        // Basic email format check
        if (!email.contains("@") || !email.contains(".")) {
            log.warn("NOTIFICATION | Invalid email format: {}", email);
            return;
        }

        try {
            int estimatedWaitMinutes = queuePosition * 15;
            String subject = "✅ HealTrack — Booking Confirmed! Token #" + booking.getToken();
            String body = buildEmailBody(booking, queuePosition, estimatedWaitMinutes);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "HealTrack Hospital");
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML

            mailSender.send(message);
            log.info("NOTIFICATION | Email sent to {} for token #{}", email, booking.getToken());

        } catch (MessagingException e) {
            // Non-blocking — log and continue; booking already saved
            log.error("NOTIFICATION | Failed to send email to {}: {}", email, e.getMessage());
        } catch (Exception e) {
            log.error("NOTIFICATION | Unexpected error: {}", e.getMessage());
        }
    }

    private String buildEmailBody(Booking booking, int queuePosition, int waitMinutes) {
        String waitText = waitMinutes <= 0
                ? "You are next!"
                : "Approx. <strong>" + waitMinutes + " minutes</strong>";

        String dateText = booking.getBookingDate() != null && !booking.getBookingDate().isBlank()
                ? booking.getBookingDate() : "Today";
        String timeText = booking.getBookingTime() != null && !booking.getBookingTime().isBlank()
                ? booking.getBookingTime() : "As scheduled";
        String doctorText = booking.getDoctor() != null && !booking.getDoctor().isBlank()
                ? booking.getDoctor() : "Assigned Doctor";
        String hospitalText = booking.getHospital() != null && !booking.getHospital().isBlank()
                ? booking.getHospital() : "HealTrack Hospital";

        return "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;" +
            "background:#f0f4f8;font-family:Arial,sans-serif;'>" +
            "<div style='max-width:600px;margin:30px auto;background:white;border-radius:16px;" +
            "overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>" +

            // Header
            "<div style='background:linear-gradient(135deg,#0077b6,#00b4d8);padding:32px 28px;text-align:center;'>" +
            "<h1 style='color:white;margin:0;font-size:26px;'>🏥 HealTrack</h1>" +
            "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;'>Hospital Management System</p>" +
            "</div>" +

            // Confirmation badge
            "<div style='text-align:center;padding:28px 28px 0;'>" +
            "<div style='display:inline-block;background:#e8f5e9;border:2px solid #43e97b;" +
            "border-radius:50px;padding:10px 28px;'>" +
            "<span style='color:#1b5e20;font-weight:700;font-size:16px;'>✅ Booking Confirmed!</span>" +
            "</div>" +
            "</div>" +

            // Token number (big)
            "<div style='text-align:center;padding:24px 28px 0;'>" +
            "<p style='margin:0;color:#666;font-size:14px;text-transform:uppercase;letter-spacing:1px;'>Your Token Number</p>" +
            "<div style='font-size:64px;font-weight:900;color:#0077b6;line-height:1;margin:8px 0;'>#" + booking.getToken() + "</div>" +
            "</div>" +

            // Queue info
            "<div style='margin:20px 28px;background:#fff8e1;border:1px solid #ffe082;" +
            "border-radius:12px;padding:16px 20px;text-align:center;'>" +
            "<p style='margin:0;color:#e65100;font-size:14px;font-weight:600;'>⏳ Queue Position</p>" +
            "<p style='margin:6px 0 0;font-size:22px;font-weight:800;color:#bf360c;'>" +
            (queuePosition <= 0 ? "You are NEXT!" : queuePosition + " patients ahead of you") +
            "</p>" +
            "<p style='margin:6px 0 0;color:#e65100;font-size:13px;'>Estimated wait: " + waitText + "</p>" +
            "</div>" +

            // Details table
            "<div style='padding:0 28px 28px;'>" +
            "<table style='width:100%;border-collapse:collapse;margin-top:8px;'>" +
            buildRow("👤 Patient Name", booking.getName()) +
            buildRow("👨‍⚕️ Doctor", doctorText) +
            buildRow("🏥 Hospital", hospitalText) +
            buildRow("📅 Appointment Date", dateText) +
            buildRow("🕐 Time Slot", timeText) +
            (booking.getCondition() != null && !booking.getCondition().isBlank()
                ? buildRow("❤️ Condition", booking.getCondition()) : "") +
            "</table>" +
            "</div>" +

            // Footer
            "<div style='background:#f8fafc;padding:20px 28px;text-align:center;" +
            "border-top:1px solid #e0e0e0;'>" +
            "<p style='margin:0;color:#aaa;font-size:12px;'>" +
            "This is an automated message from HealTrack Hospital Management System.<br>" +
            "Please arrive 10 minutes before your scheduled time slot." +
            "</p>" +
            "</div>" +

            "</div></body></html>";
    }

    private String buildRow(String label, String value) {
        return "<tr>" +
            "<td style='padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;" +
            "font-size:13px;width:45%;'>" + label + "</td>" +
            "<td style='padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;" +
            "color:#222;font-size:13px;'>" + (value != null ? value : "—") + "</td>" +
            "</tr>";
    }
}
