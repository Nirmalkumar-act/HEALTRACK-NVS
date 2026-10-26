package com.healtrack.hmsbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    // Comma-separated list of allowed origins.
    // Set CORS_ALLOWED_ORIGINS env var on Render with your Netlify URL.
    // Example: https://healtrackNVS.netlify.app,https://custom-domain.com
    @Value("${cors.allowed.origins:http://localhost:5173}")
    private String allowedOriginsRaw;

    private List<String> getAllowedOrigins() {
        List<String> origins = new ArrayList<>();
        // Always include local dev origins
        origins.add("http://localhost:5173");
        origins.add("http://localhost:3000");
        origins.add("http://localhost:8080");
        origins.add("http://localhost:8081");
        // Always include production Netlify URL (lowercase, uppercase, hyphenated, wildcard)
        origins.add("https://healtracknvs.netlify.app");
        origins.add("https://healtrackNVS.netlify.app");
        origins.add("https://healtrack-nvs.netlify.app");
        origins.add("https://*.netlify.app");
        origins.add("https://*.onrender.com");
        origins.add("*");
        // Add any extra origins from environment variable (comma-separated)
        if (allowedOriginsRaw != null && !allowedOriginsRaw.isBlank()) {
            Arrays.stream(allowedOriginsRaw.split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .forEach(origins::add);
        }
        return origins;
    }

    /**
     * Used by Spring Security's .cors() to apply CORS headers at the filter chain level.
     * This ensures preflight OPTIONS requests are handled correctly before reaching MVC.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(getAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Also configure CORS at the MVC layer for completeness.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(getAllowedOrigins().toArray(new String[0]))
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
