package com.chuyendeweb2.group05.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.chuyendeweb2.group05.config.JwtService;
import com.chuyendeweb2.group05.dto.*;
import com.chuyendeweb2.group05.entity.meta.Token;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.entity.meta.VerificationToken;
import com.chuyendeweb2.group05.enums.TokenType;
import com.chuyendeweb2.group05.repo.TokenRepository;
import com.chuyendeweb2.group05.repo.UserRepository;
import com.chuyendeweb2.group05.service.AuthenticationService;
import com.chuyendeweb2.group05.service.EmailService;
import com.chuyendeweb2.group05.service.OtpService;
import com.chuyendeweb2.group05.service.VerificationTokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final EmailService emailService;
    private final VerificationTokenService verificationTokenService;

    @Override
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .mobileNumber(request.getMobileNumber())
                .gender(request.getGender())
                .role(request.getRole())
                .twoFactorEnabled(false)
                .twoFactorVerified(false)
                .enabled(true) // Set to false until email verification
                .build();

        var savedUser = repository.save(user);

        // Generate and send activation OTP instead of token
        otpService.generateAccountActivationOtp(savedUser.getEmail());

        // Generate JWT tokens
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(savedUser, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .requireTwoFactor(false)
                .build();
    }

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        // Check if account is activated
        if (!user.isEnabled()) {
            throw new IllegalStateException("Account not activated. Please check your email for activation code.");
        }

        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled()) {
            // Send OTP
            otpService.generateOtp(user.getEmail());

            // Return response indicating 2FA is required
            return AuthenticationResponse.builder()
                    .requireTwoFactor(true)
                    .build();
        }

        // If 2FA is not enabled, proceed with normal authentication
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .requireTwoFactor(false)
                .build();
    }

    // Other existing methods remain the same...

    @Override
    public boolean forgotPassword(ForgotPasswordRequest request) {
        var userOptional = repository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            // Don't reveal that the email doesn't exist for security reasons
            return true;
        }

        User user = userOptional.get();

        // Generate and send password reset OTP instead of token
        otpService.generatePasswordResetOtp(user.getEmail());

        return true;
    }

    @Override
    @Transactional
    public boolean verifyAccountWithOtp(VerifyAccountRequest request) {
        boolean isValid = otpService.validateAccountActivationOtp(request.getEmail(), request.getOtp());

        if (!isValid) {
            return false;
        }

        var userOptional = repository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();
        user.setEnabled(true);
        repository.save(user);

        log.info("Account activated for user: {}", request.getEmail());
        return true;
    }

    @Override
    @Transactional
    public boolean resetPasswordWithOtp(ResetPasswordWithOtpRequest request) {
        boolean isValid = otpService.validatePasswordResetOtp(request.getEmail(), request.getOtp());

        if (!isValid) {
            return false;
        }

        var userOptional = repository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);

        // Revoke all existing tokens for security
        revokeAllUserTokens(user);

        log.info("Password reset for user: {}", request.getEmail());
        return true;
    }

    // Keep the token-based methods for backward compatibility
    @Override
    @Transactional
    public boolean activateAccount(String token) {
        VerificationToken verificationToken = verificationTokenService.validateToken(token);

        if (verificationToken == null ||
                verificationToken.getPurpose() != VerificationToken.TokenPurpose.ACCOUNT_ACTIVATION) {
            return false;
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        repository.save(user);

        // Delete the token after use
        verificationTokenService.deleteToken(verificationToken);

        return true;
    }

    @Override
    @Transactional
    public boolean resetPassword(ResetPasswordRequest request) {
        // If token is provided, use token-based verification
        if (request.getToken() != null && !request.getToken().isEmpty()) {
            VerificationToken verificationToken = verificationTokenService.validateToken(request.getToken());

            if (verificationToken == null ||
                    verificationToken.getPurpose() != VerificationToken.TokenPurpose.PASSWORD_RESET) {
                return false;
            }

            User user = verificationToken.getUser();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            repository.save(user);

            // Delete the token after use
            verificationTokenService.deleteToken(verificationToken);

            // Revoke all existing tokens for security
            revokeAllUserTokens(user);

            return true;
        }
        // If email is provided but no token, treat it as an OTP-based request
        else if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            // Convert to OTP-based request
            ResetPasswordWithOtpRequest otpRequest = new ResetPasswordWithOtpRequest();
            otpRequest.setEmail(request.getEmail());
            otpRequest.setNewPassword(request.getNewPassword());
            // Note: This won't work without an OTP, but it prevents the parsing error

            log.warn("Received password reset request with email but no token or OTP. " +
                    "Please use the proper endpoint for OTP-based password reset.");
            return false;
        }

        return false;
    }

    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    @Override
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.repository.findByEmail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .requireTwoFactor(false)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

    @Override
    public boolean sendOtp(String email) {
        User user = repository.findByEmail(email).orElse(null);
        if (user == null) {
            return false;
        }

        // Generate OTP
        String otp = otpService.generateOtp(email);
        return true;
    }

    @Override
    public TwoFactorResponse verifyOtp(TwoFactorRequest request) {
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp());

        if (isValid) {
            var user = repository.findByEmail(request.getEmail())
                    .orElseThrow();

            // If this is the first time verifying 2FA, mark as verified
            if (user.isTwoFactorEnabled() && !user.isTwoFactorVerified()) {
                user.setTwoFactorVerified(true);
                repository.save(user);
            }

            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            revokeAllUserTokens(user);
            saveUserToken(user, jwtToken);

            var authResponse = AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .requireTwoFactor(false)
                    .build();

            return TwoFactorResponse.builder()
                    .success(true)
                    .message("OTP verified successfully")
                    .authResponse(authResponse)
                    .build();
        }

        return TwoFactorResponse.builder()
                .success(false)
                .message("Invalid or expired OTP")
                .build();
    }

    @Override
    public boolean enableTwoFactor(String email) {
        var userOptional = repository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setTwoFactorEnabled(true);
            repository.save(user);

            // Send OTP for initial verification
            otpService.generateOtp(email);

            return true;
        }
        return false;
    }

    @Override
    public boolean disableTwoFactor(String email) {
        var userOptional = repository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setTwoFactorEnabled(false);
            user.setTwoFactorVerified(false);
            repository.save(user);
            return true;
        }
        return false;
    }
}
