package com.healtrack.hmsbackend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            // ── Production: Parse Neon/Supabase PostgreSQL URL ─────────────────
            log.info("=== HealTrack: Using production DATABASE_URL ===");
            try {
                // Clean the URL — users sometimes paste "psql 'URL'" from Neon docs
                String cleaned = databaseUrl.trim();
                // Remove psql '...' wrapper if present
                if (cleaned.startsWith("psql ")) {
                    cleaned = cleaned.replaceFirst("^psql\\s+'?", "").replaceAll("'$", "");
                }
                // Remove any surrounding quotes
                cleaned = cleaned.replaceAll("^['\"]|['\"]$", "").trim();

                log.info("=== Cleaned DATABASE_URL scheme: {} ===",
                    cleaned.contains("://") ? cleaned.substring(0, cleaned.indexOf("://")) : "unknown");

                // Normalize scheme so URI can parse it
                String normalized = cleaned
                        .replace("postgresql://", "http://")
                        .replace("postgres://", "http://");
                URI uri = URI.create(normalized);

                String host     = uri.getHost();
                int    port     = uri.getPort() > 0 ? uri.getPort() : 5432;
                String dbName   = uri.getPath().replaceFirst("^/", "");
                String userInfo = uri.getUserInfo() != null ? uri.getUserInfo() : "";
                String user     = userInfo.contains(":") ? userInfo.split(":", 2)[0] : userInfo;
                String pass     = userInfo.contains(":") ? userInfo.split(":", 2)[1] : "";
                String query    = uri.getQuery() != null ? "?" + uri.getQuery() : "?sslmode=require";

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName + query;

                log.info("=== Connecting to PostgreSQL: {}:{}/{} ===", host, port, dbName);

                config.setJdbcUrl(jdbcUrl);
                config.setUsername(user);
                config.setPassword(pass);
                config.setDriverClassName("org.postgresql.Driver");

            } catch (Exception e) {
                log.error("=== Failed to parse DATABASE_URL, trying as raw JDBC URL ===", e);
                // Last resort: use as-is (already jdbc: prefixed)
                String url = databaseUrl.startsWith("jdbc:") ? databaseUrl : "jdbc:" + databaseUrl;
                config.setJdbcUrl(url);
            }

        } else {
            // ── Local development: MySQL fallback ──────────────────────────────
            log.info("=== HealTrack: Using local MySQL (no DATABASE_URL set) ===");
            config.setJdbcUrl("jdbc:mysql://localhost:3306/hms_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
            config.setUsername("root");
            config.setPassword("nirmal");
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        }

        config.setMaximumPoolSize(3);
        config.setConnectionTimeout(30000);
        config.setInitializationFailTimeout(-1); // Don't crash if DB is slow
        config.setPoolName("HealTrackPool");

        return new HikariDataSource(config);
    }
}
