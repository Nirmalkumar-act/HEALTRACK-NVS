package com.healtrack.hmsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;

// Exclude the auto-config that generates a random default Security user &
// spams the log with "Using generated security password" warning.
// We handle authentication manually via AuthService + SecurityConfig.
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableAsync   // Required for @Async on NotificationServiceImpl
public class HmsBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmsBackendApplication.class, args);
    }
}
