package com.chuyendeweb2.group05.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import com.chuyendeweb2.group05.dto.AuthenticationRequest;
import com.chuyendeweb2.group05.dto.AuthenticationResponse;
import com.chuyendeweb2.group05.dto.ForgotPasswordRequest;
import com.chuyendeweb2.group05.dto.RegisterRequest;
import com.chuyendeweb2.group05.dto.ResetPasswordRequest;
import com.chuyendeweb2.group05.dto.ResetPasswordWithOtpRequest;
import com.chuyendeweb2.group05.dto.TwoFactorRequest;
import com.chuyendeweb2.group05.dto.TwoFactorResponse;
import com.chuyendeweb2.group05.dto.VerifyAccountRequest;

public interface AuthenticationService {

    AuthenticationResponse register(RegisterRequest request);

    AuthenticationResponse authenticate(AuthenticationRequest request);

    void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException;

    boolean sendOtp(String email);

    TwoFactorResponse verifyOtp(TwoFactorRequest request);

    boolean enableTwoFactor(String email);

    boolean disableTwoFactor(String email);

    // Existing token-based methods
    boolean activateAccount(String token);

    boolean forgotPassword(ForgotPasswordRequest request);

    boolean resetPassword(ResetPasswordRequest request);

    // New OTP-based methods
    boolean verifyAccountWithOtp(VerifyAccountRequest request);

    boolean resetPasswordWithOtp(ResetPasswordWithOtpRequest request);
}
