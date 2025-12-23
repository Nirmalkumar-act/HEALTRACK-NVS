package com.healtrack.hmsbackend.controller;

import com.healtrack.hmsbackend.model.User;
import com.healtrack.hmsbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> loggedIn = authService.login(user);

        if (loggedIn.isPresent()) {
            return ResponseEntity.ok(loggedIn.get());
        } else {
            return ResponseEntity
                    .status(401)
                    .body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }
}
