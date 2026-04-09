package com.healtrack.hmsbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class AIServiceImpl implements AIService {

    private static final Logger log = LoggerFactory.getLogger(AIServiceImpl.class);

    // ─── SAFETY CONSTANTS ──────────────────────────────────────────────────────
    private static final int MAX_MESSAGE_LENGTH = 2000;

    private static final String MEDICAL_DISCLAIMER =
        "\n\n⚠️ *Disclaimer: This response is for informational purposes only and does " +
        "not constitute medical advice, diagnosis, or treatment. Always consult a " +
        "qualified healthcare professional for medical concerns.*";

    private static final String EMERGENCY_RESPONSE =
        "🚨 **This sounds like a medical emergency. Please call emergency services " +
        "(112 / 108 in India) or go to your nearest emergency room immediately.**\n\n" +
        "Do not wait for an AI response in a life-threatening situation.\n\n" +
        "**Common emergency numbers:**\n" +
        "- National Emergency: 112\n" +
        "- Ambulance: 108\n" +
        "- Police: 100\n" +
        "- Fire: 101";

    // Keywords that trigger immediate emergency escalation
    private static final Set<String> EMERGENCY_KEYWORDS = Set.of(
        "chest pain", "heart attack", "can't breathe", "cannot breathe",
        "shortness of breath", "unconscious", "suicide", "kill myself",
        "overdose", "stroke", "seizure", "severe bleeding", "choking",
        "anaphylaxis", "allergic reaction", "not breathing", "losing consciousness",
        "severe chest", "cardiac", "dying", "call ambulance"
    );

    private static final String SYSTEM_PROMPT =
        "You are a safe and responsible medical information assistant for HealTrack " +
        "Hospital Management System used in India. Your role is to:\n" +
        "1. Help users understand general medical information and symptoms\n" +
        "2. Guide them on when to seek professional medical care\n" +
        "3. Provide evidence-informed, conservative guidance\n" +
        "4. Always recommend consulting a doctor for diagnosis or treatment\n\n" +
        "You MUST:\n" +
        "- Never diagnose conditions\n" +
        "- Never prescribe medications or dosages\n" +
        "- Never contradict a doctor's advice\n" +
        "- Always include a recommendation to see a doctor for serious symptoms\n" +
        "- Be clear, calm, and reassuring\n" +
        "- Keep responses concise (under 300 words)\n\n" +
        "If the user describes a life-threatening emergency, respond ONLY with " +
        "instructions to call 112/108 immediately.\n\n";

    @Value("${gemini.api.key}")
    private String apiKey;

    // Ordered list of models to try — first hit wins, fallback on 429 or 404
    // All names verified against ListModels API response for this key.
    private static final String[] MODELS = {
        "gemini-2.0-flash",         // primary: fast, free tier (15 RPM)
        "gemini-2.0-flash-lite",    // lighter quota on same family
        "gemini-2.0-flash-001",     // explicit versioned stable alias
        "gemini-2.5-flash-lite",    // different model family = separate quota pool
        "gemini-flash-lite-latest", // latest flash-lite alias
    };

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String getMedicalResponse(String userMessage) {

        // ── 1. Input validation ────────────────────────────────────────────────
        if (userMessage == null || userMessage.isBlank()) {
            return "Please enter a message to get assistance.";
        }
        if (userMessage.length() > MAX_MESSAGE_LENGTH) {
            return "Your message is too long. Please keep it under " + MAX_MESSAGE_LENGTH + " characters.";
        }

        String lowerMsg = userMessage.toLowerCase();

        // ── 2. Emergency detection — bypass Gemini entirely ──────────────────
        for (String keyword : EMERGENCY_KEYWORDS) {
            if (lowerMsg.contains(keyword)) {
                log.warn("EMERGENCY keyword detected in message: [{}]", keyword);
                return EMERGENCY_RESPONSE;
            }
        }

        // ── 3. Build Gemini request using Jackson (safe JSON construction) ────
        try {
            ObjectNode requestBody = mapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", SYSTEM_PROMPT + "User: " + userMessage);

            // Safety settings — block harmful medical misinformation
            ArrayNode safetySettings = requestBody.putArray("safetySettings");
            addSafetySetting(safetySettings, "HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_MEDIUM_AND_ABOVE");
            addSafetySetting(safetySettings, "HARM_CATEGORY_HARASSMENT", "BLOCK_MEDIUM_AND_ABOVE");
            addSafetySetting(safetySettings, "HARM_CATEGORY_HATE_SPEECH", "BLOCK_MEDIUM_AND_ABOVE");

            // Generation config — constrain output
            ObjectNode genConfig = requestBody.putObject("generationConfig");
            genConfig.put("maxOutputTokens", 512);
            genConfig.put("temperature", 0.2);  // low temperature = more conservative responses
            genConfig.put("topP", 0.8);

            String bodyJson = mapper.writeValueAsString(requestBody);

            // ── 4. Try each model in order ────────────────────────────────
            String lastError = "AI service temporarily unavailable. Please try again shortly.";
            for (String model : MODELS) {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                           + model + ":generateContent?key=" + apiKey;

                Request request = new Request.Builder()
                        .url(url)
                        .post(RequestBody.create(bodyJson, MediaType.parse("application/json")))
                        .addHeader("Content-Type", "application/json")
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    String json = response.body() != null ? response.body().string() : "";

                    if (response.code() == 429) {
                        log.warn("Rate-limited on model={} — trying next fallback", model);
                        lastError = "⏳ AI assistant is busy right now. Please send your message again in a moment.";
                        try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
                        continue; // try next model
                    }

                    if (!response.isSuccessful()) {
                        log.error("Gemini API error {} | model={} | body: {}", response.code(), model, json);
                        lastError = switch (response.code()) {
                            case 400 -> "Your message could not be processed. Please rephrase and try again.";
                            case 403 -> "AI service configuration error. Please contact support.";
                            case 404 -> "AI model not available. Please contact support.";
                            default  -> "AI service temporarily unavailable. Please try again shortly.";
                        };
                        continue; // try next model
                    }

                    JsonNode root = mapper.readTree(json);

                    // Check for safety block
                    JsonNode promptFeedback = root.path("promptFeedback");
                    if (!promptFeedback.isMissingNode()) {
                        String blockReason = promptFeedback.path("blockReason").asText("");
                        if (!blockReason.isEmpty()) {
                            log.warn("Gemini blocked response. Reason: {}", blockReason);
                            return "I'm unable to respond to that query. If you have a medical concern, "
                                 + "please consult a healthcare professional directly.";
                        }
                    }

                    // Extract response text
                    String text = root
                            .path("candidates").path(0)
                            .path("content")
                            .path("parts").path(0)
                            .path("text").asText("").trim();

                    if (text.isEmpty()) {
                        log.warn("Empty text from model={} | msgHash={}", model, userMessage.hashCode());
                        lastError = "I could not generate a response. Please rephrase or consult a healthcare professional.";
                        continue;
                    }

                    log.info("AI_CHAT | model={} | msgLen={} | replyLen={} | status=ok",
                             model, userMessage.length(), text.length());

                    return text + MEDICAL_DISCLAIMER;
                }
            }
            // All models exhausted
            return lastError;

        } catch (Exception e) {
            log.error("AIServiceImpl error: {}", e.getMessage(), e);
            return "An unexpected error occurred. Please try again or contact support.";
        }
    }

    private void addSafetySetting(ArrayNode settings, String category, String threshold) {
        ObjectNode setting = settings.addObject();
        setting.put("category", category);
        setting.put("threshold", threshold);
    }
}
