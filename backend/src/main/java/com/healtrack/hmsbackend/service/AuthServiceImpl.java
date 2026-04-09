package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.User;
import com.healtrack.hmsbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User register(User user) {
        if (user == null) throw new IllegalArgumentException("User cannot be null");
        if (user.getRole() == null || user.getRole().isEmpty()) user.setRole("USER");
        if (user.getName() == null || user.getName().isEmpty()) user.setName("Guest");
        return userRepository.save(user);
    }

    @Override
    public User login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

    @Override
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        // ✅ Blank out passwords before returning — never expose them
        users.forEach(u -> u.setPassword("[protected]"));
        return users;
    }
}
