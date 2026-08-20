package com.securepay.backend.service;

import com.securepay.backend.dto.LoginRequest;
import com.securepay.backend.dto.LoginResponse;
import com.securepay.backend.dto.RegisterRequest;
import com.securepay.backend.entity.User;
import com.securepay.backend.repository.UserRepository;
import com.securepay.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil=jwtUtil;

    }


//register user
    public String register(RegisterRequest request) {

        Optional<User> existingUser =
                userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            return "Email already exists";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        userRepository.save(user);

        return "User Registered Successfully";
    }

    //loginuser
    public LoginResponse login(LoginRequest request) {

        Optional<User> existingUser =
                userRepository.findByEmail(request.getEmail());

        if (existingUser.isEmpty()) {
            throw new RuntimeException("Invalid Email or Password");
        }

        User user = existingUser.get();

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid Email or Password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token);
    }
}