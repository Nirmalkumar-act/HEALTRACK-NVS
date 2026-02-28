package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.User;
import com.healtrack.hmsbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

@Override
public User register(User user) {

    if (user == null) {
        throw new IllegalArgumentException("User cannot be null");
    }

    // ✅ Default role if not provided
    if (user.getRole() == null || user.getRole().isEmpty()) {
        user.setRole("USER");
    }

    // ✅ Default name if null
    if (user.getName() == null || user.getName().isEmpty()) {
        user.setName("Guest");
    }

    return userRepository.save(user);
}
    @Override
    public User login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }
}
