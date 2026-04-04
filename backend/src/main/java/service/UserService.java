package com.shunyaai.backend.service;

import com.shunyaai.backend.dto.AuthRequest;
import com.shunyaai.backend.dto.AuthResponse;
import com.shunyaai.backend.entity.RefreshToken;
import com.shunyaai.backend.entity.Role;
import com.shunyaai.backend.entity.User;
import com.shunyaai.backend.repository.RefreshTokenRepository;
import com.shunyaai.backend.repository.UserRepository;
import com.shunyaai.backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private final long REFRESH_EXPIRATION = 1000L * 60 * 60 * 24 * 7; // 7 days

    // =============================
    // REGISTER
    // =============================
    public AuthResponse register(AuthRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse("Email already registered", null, null, null);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        userRepository.save(user);

        return new AuthResponse("User registered successfully", null, null, null);
    }

    // =============================
    // LOGIN
    // =============================
    public AuthResponse login(AuthRequest request) {

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return new AuthResponse("User not found", null, null, null);
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse("Invalid password", null, null, null);
        }

        // 🔥 Generate Access Token
        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // 🔥 Generate Refresh Token
        String refreshTokenString = UUID.randomUUID().toString();

        // Delete old refresh tokens for this user
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenString);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(
                Instant.now().plusMillis(REFRESH_EXPIRATION)
        );

        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                "Login successful",
                accessToken,
                refreshTokenString,
                user.getRole().name()
        );
    }

    // =============================
    // REFRESH TOKEN
    // =============================
    public AuthResponse refreshToken(String refreshTokenString) {

        Optional<RefreshToken> optionalToken =
                refreshTokenRepository.findByToken(refreshTokenString);

        if (optionalToken.isEmpty()) {
            return new AuthResponse("Invalid refresh token", null, null, null);
        }

        RefreshToken refreshToken = optionalToken.get();

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            return new AuthResponse("Refresh token expired", null, null, null);
        }

        User user = refreshToken.getUser();

        // 🔥 Rotate refresh token
        refreshTokenRepository.delete(refreshToken);

        String newRefreshToken = UUID.randomUUID().toString();

        RefreshToken newToken = new RefreshToken();
        newToken.setToken(newRefreshToken);
        newToken.setUser(user);
        newToken.setExpiryDate(
                Instant.now().plusMillis(REFRESH_EXPIRATION)
        );

        refreshTokenRepository.save(newToken);

        String newAccessToken =
                jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                "Token refreshed",
                newAccessToken,
                newRefreshToken,
                user.getRole().name()
        );
    }

    // =============================
    // LOGOUT
    // =============================
    public void logout(String email) {

        Optional<User> userOptional =
                userRepository.findByEmail(email);

        userOptional.ifPresent(refreshTokenRepository::deleteByUser);
    }
}
