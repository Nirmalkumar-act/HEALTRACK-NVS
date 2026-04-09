package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.ChatRequest;
import com.healtrack.hmsbackend.model.ChatResponse;
import com.healtrack.hmsbackend.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin  // Fine for dev; CorsConfig handles production
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);
    private static final int MAX_LENGTH = 2000;

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
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

    // Health check endpoint for monitoring
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "ai-chat"));
    }
}
