package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.ChatRequest;
import com.healtrack.hmsbackend.model.ChatResponse;
import com.healtrack.hmsbackend.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin  // Fine for dev; CorsConfig handles production
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);
    private static final int MAX_LENGTH = 2000;

    private final AIService aiService;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public AIController(AIService aiService, JavaMailSender mailSender) {
        this.aiService = aiService;
        this.mailSender = mailSender;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {

        // ── Input validation ──────────────────────────────────────────────────
        String message = request.getMessage();

        if (message == null || message.isBlank()) {
            log.warn("AI_CHAT | validation=fail | reason=blank_message");
            return ResponseEntity.badRequest()
                    .body(Map.of("reply", "Please enter a message before sending."));
        }

        if (message.length() > MAX_LENGTH) {
            log.warn("AI_CHAT | validation=fail | reason=too_long | len={}", message.length());
            return ResponseEntity.badRequest()
                    .body(Map.of("reply",
                        "Your message is too long. Please keep it under " + MAX_LENGTH + " characters."));
        }

        // ── Delegate to service ───────────────────────────────────────────────
        String reply = aiService.getMedicalResponse(message);

        return ResponseEntity.ok(new ChatResponse(reply));
    }

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestBody Map<String, String> req) {
        String to = req.getOrDefault("email", "");
        if (to.isBlank()) return ResponseEntity.badRequest().body(Map.of("result", "No email provided"));
        try {
            com.healtrack.hmsbackend.model.Booking testBooking = new com.healtrack.hmsbackend.model.Booking();
            testBooking.setToken(1111);
            testBooking.setName("Test Patient");
            testBooking.setDoctor("Dr. Test");
            testBooking.setHospital("HealTrack Test");
            testBooking.setCondition("Fever");
            testBooking.setBookingDate(java.time.LocalDate.now().toString());
            testBooking.setBookingTime("10:00 AM");
            testBooking.setEmail(to);
            // Call sync version for test only
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "HealTrack Hospital");
            helper.setTo(to);
            helper.setSubject("✅ HealTrack Test Email");
            helper.setText("<h2>Test email working!</h2><p>Your HealTrack notification system is configured correctly.</p>", true);
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("result", "SUCCESS — Email sent to " + to));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("result", "FAILED: " + e.getMessage()));
        }
    }

    // Health check endpoint for monitoring
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "ai-chat"));
    }

    @PostMapping("/check-clash")
    public ResponseEntity<Map<String, String>> checkClash(@RequestBody Map<String, String> request) {
        String patientName = request.get("patientName");
        String newMedications = request.get("newMedications");

        if (patientName == null || patientName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("result", "[SAFE] Patient name missing."));
        }
        if (newMedications == null || newMedications.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("result", "[SAFE] No medications provided to check."));
        }

        String aiResult = aiService.checkDrugInteractions(patientName, newMedications);
        return ResponseEntity.ok(Map.of("result", aiResult));
    }
}
