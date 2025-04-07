package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.*;
import com.chuyendeweb2.group05.service.AuthenticationService;
import com.chuyendeweb2.group05.service.SocialLoginService;
import com.chuyendeweb2.group05.util.StandardResponse;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Auth management APIs")
@Slf4j
public class AuthenticationController {

    private final AuthenticationService service;
    private final SocialLoginService socialLoginService;

    @PostMapping("/verify-account")
    public ResponseEntity<StandardResponse> verifyAccount(@RequestBody VerifyAccountRequest request) {
        boolean verified = service.verifyAccountWithOtp(request);

        if (verified) {
            return new ResponseEntity<>(new StandardResponse("200", "Account activated successfully", null),
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("400", "Invalid or expired OTP", null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/reset-password-with-otp")
    public ResponseEntity<StandardResponse> resetPasswordWithOtp(@RequestBody ResetPasswordWithOtpRequest request) {
        boolean reset = service.resetPasswordWithOtp(request);

        if (reset) {
            return new ResponseEntity<>(new StandardResponse("200", "Password reset successfully", null),
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("400", "Invalid or expired OTP", null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<StandardResponse> register(@RequestBody RegisterRequest request) {
        return new ResponseEntity<>(new StandardResponse("200", "Done", service.register(request)), HttpStatus.OK);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<StandardResponse> authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = service.authenticate(request);

        if (response.isRequireTwoFactor()) {
            return new ResponseEntity<>(new StandardResponse("200", "2FA required", response), HttpStatus.OK);
        }

        return new ResponseEntity<>(new StandardResponse("200", "Done", response), HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        service.refreshToken(request, response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<StandardResponse> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean sent = service.sendOtp(email);

        if (sent) {
            return new ResponseEntity<>(new StandardResponse("200", "OTP sent successfully", null), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("404", "User not found", null), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<StandardResponse> verifyOtp(@RequestBody TwoFactorRequest request) {
        TwoFactorResponse response = service.verifyOtp(request);

        if (response.isSuccess()) {
            return new ResponseEntity<>(new StandardResponse("200", response.getMessage(), response.getAuthResponse()),
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("400", response.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/enable-2fa")
    public ResponseEntity<StandardResponse> enableTwoFactor(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean enabled = service.enableTwoFactor(email);

        if (enabled) {
            return new ResponseEntity<>(
                    new StandardResponse("200", "2FA enabled successfully. Please verify with OTP.", null),
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("404", "User not found", null), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/disable-2fa")
    public ResponseEntity<StandardResponse> disableTwoFactor(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean disabled = service.disableTwoFactor(email);

        if (disabled) {
            return new ResponseEntity<>(new StandardResponse("200", "2FA disabled successfully", null), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("404", "User not found", null), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/social-login")
    public ResponseEntity<StandardResponse> socialLogin(@RequestBody SocialLoginRequest request) {
        try {
            log.info("Social login request received for provider: {}", request.getProvider());
            AuthenticationResponse response = socialLoginService.processSocialLogin(request);
            return new ResponseEntity<>(new StandardResponse("200", "Login successful", response), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error in social login", e);
            return new ResponseEntity<>(
                    new StandardResponse("400", "Error processing social login: " + e.getMessage(), null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/activate")
    public ResponseEntity<StandardResponse> activateAccount(@RequestParam String token) {
        boolean activated = service.activateAccount(token);

        if (activated) {
            return new ResponseEntity<>(new StandardResponse("200", "Account activated successfully", null),
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new StandardResponse("400", "Invalid or expired token", null),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<StandardResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        service.forgotPassword(request);
        // Always return success to prevent email enumeration attacks
        return new ResponseEntity<>(
                new StandardResponse("200",
                        "If your email exists in our system, you will receive a password reset code", null),
                HttpStatus.OK);
    }

}
