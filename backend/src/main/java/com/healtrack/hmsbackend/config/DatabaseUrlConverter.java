package com.healtrack.hmsbackend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Runs before Spring Boot configures the DataSource.
 * Converts postgresql:// or postgres:// URLs to jdbc:postgresql://
 * so users can paste Neon/Supabase/Render URLs directly without worrying about format.
 */
public class DatabaseUrlConverter implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,
                                       SpringApplication application) {

        String rawUrl = environment.getProperty("DATABASE_URL", "");

        if (rawUrl.isBlank()) return; // not set — use local MySQL fallback from application.properties

        String jdbcUrl = rawUrl;

        // Auto-convert Neon/Supabase/Render native URL → JDBC URL
        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            // e.g. postgresql://user:pass@host/db?sslmode=require
            //    → jdbc:postgresql://host/db?user=user&password=pass&sslmode=require
            jdbcUrl = "jdbc:" + rawUrl;          // simplest: just prepend jdbc:
        }
        // If already starts with jdbc: — use as-is
        // If it's a MySQL URL — use as-is

        Map<String, Object> overrides = new HashMap<>();
        overrides.put("spring.datasource.url", jdbcUrl);
        environment.getPropertySources()
                   .addFirst(new MapPropertySource("databaseUrlAutoFix", overrides));
    }
}
