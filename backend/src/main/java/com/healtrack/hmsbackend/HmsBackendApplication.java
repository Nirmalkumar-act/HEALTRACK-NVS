package com.healtrack.hmsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync   // Required for @Async on NotificationServiceImpl
public class HmsBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmsBackendApplication.class, args);
    }
}
