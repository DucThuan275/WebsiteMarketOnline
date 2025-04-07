package com.chuyendeweb2.group05.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp);

    void sendVerificationEmail(String to, String token);

    void sendPasswordResetEmail(String to, String token);

    // New methods for OTP-based emails
    void sendAccountActivationOtp(String to, String otp);

    void sendPasswordResetOtp(String to, String otp);
}
