package com.healtrack.hmsbackend.service;

import com.healtrack.hmsbackend.model.User;
import java.util.List;

public interface AuthService {

    User register(User user);

    User login(String email, String password);

    List<User> getAllUsers();
}
