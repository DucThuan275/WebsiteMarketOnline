package com.chuyendeweb2.group05.service.impl;

import com.chuyendeweb2.group05.config.JwtService;
import com.chuyendeweb2.group05.dto.AuthenticationResponse;
import com.chuyendeweb2.group05.dto.SocialLoginRequest;
import com.chuyendeweb2.group05.entity.meta.Token;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.Role;
import com.chuyendeweb2.group05.enums.TokenType;
import com.chuyendeweb2.group05.repo.TokenRepository;
import com.chuyendeweb2.group05.repo.UserRepository;
import com.chuyendeweb2.group05.service.SocialLoginService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialLoginServiceImpl implements SocialLoginService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${facebook.app.id}")
    private String facebookAppId;

    @Value("${facebook.app.secret}")
    private String facebookAppSecret;

    @Override
    public AuthenticationResponse processSocialLogin(SocialLoginRequest request) {
        if ("google".equalsIgnoreCase(request.getProvider())) {
            return loginWithGoogle(request.getToken());
        } else if ("facebook".equalsIgnoreCase(request.getProvider())) {
            return loginWithFacebook(request.getToken());
        }
        throw new IllegalArgumentException("Unsupported provider: " + request.getProvider());
    }

    @Override
    @Transactional
    public AuthenticationResponse loginWithGoogle(String accessToken) {
        try {
            log.info("Processing Google login with access token");

            // Use the access token to get user info from Google API
            String userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + accessToken;
            String userInfoResponse = restTemplate.getForObject(userInfoUrl, String.class);

            if (userInfoResponse == null) {
                throw new RuntimeException("Failed to get user info from Google");
            }

            log.info("Google user info response: {}", userInfoResponse);

            // Parse the user info
            JsonNode userInfo = objectMapper.readTree(userInfoResponse);

            String email = userInfo.get("email").asText();
            String firstName = userInfo.get("given_name").asText();
            String lastName = userInfo.get("family_name").asText();
            String googleId = userInfo.get("id").asText();

            log.info("Google user: email={}, firstName={}, lastName={}, id={}",
                    email, firstName, lastName, googleId);

            // Check if user exists
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isPresent()) {
                // User exists, update if needed
                log.info("User already exists with email: {}", email);
                user = userOptional.get();
            } else {
                // Create new user
                log.info("Creating new user with email: {}", email);
                user = User.builder()
                        .email(email)
                        .firstname(firstName)
                        .lastname(lastName)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(Role.USER)
                        .twoFactorEnabled(false)
                        .twoFactorVerified(false)
                        .enabled(true) // Social login users are automatically verified
                        .build();
                userRepository.save(user);
            }

            // Generate tokens
            String jwtToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Save token
            saveUserToken(user, jwtToken);

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .requireTwoFactor(false)
                    .build();

        } catch (Exception e) {
            log.error("Error processing Google login", e);
            throw new RuntimeException("Error processing Google login: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AuthenticationResponse loginWithFacebook(String accessToken) {
        try {
            log.info("Processing Facebook login with access token");

            // Use the access token to get user info from Facebook Graph API
            String userInfoUrl = "https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token="
                    + accessToken;
            String userInfoResponse = restTemplate.getForObject(userInfoUrl, String.class);

            if (userInfoResponse == null) {
                throw new RuntimeException("Failed to get user info from Facebook");
            }

            log.info("Facebook user info response: {}", userInfoResponse);

            // Parse the user info
            JsonNode userInfo = objectMapper.readTree(userInfoResponse);

            String email = userInfo.has("email") ? userInfo.get("email").asText() : null;
            String firstName = userInfo.get("first_name").asText();
            String lastName = userInfo.get("last_name").asText();
            String facebookId = userInfo.get("id").asText();

            // Facebook might not return email for all users
            if (email == null) {
                email = facebookId + "@facebook.com";
            }

            log.info("Facebook user: email={}, firstName={}, lastName={}, id={}",
                    email, firstName, lastName, facebookId);

            // Check if user exists
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isPresent()) {
                // User exists, update if needed
                log.info("User already exists with email: {}", email);
                user = userOptional.get();
            } else {
                // Create new user
                log.info("Creating new user with email: {}", email);
                user = User.builder()
                        .email(email)
                        .firstname(firstName)
                        .lastname(lastName)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(Role.USER)
                        .twoFactorEnabled(false)
                        .twoFactorVerified(false)
                        .enabled(true) // Social login users are automatically verified
                        .build();
                userRepository.save(user);
            }

            // Generate tokens
            String jwtToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Save token
            saveUserToken(user, jwtToken);

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .requireTwoFactor(false)
                    .build();

        } catch (Exception e) {
            log.error("Error processing Facebook login", e);
            throw new RuntimeException("Error processing Facebook login: " + e.getMessage(), e);
        }
    }

    private void saveUserToken(User user, String jwtToken) {
        // Revoke existing tokens
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepository.saveAll(validUserTokens);
        }

        // Save new token
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }
}
