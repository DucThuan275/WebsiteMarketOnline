package com.chuyendeweb2.group05.service;

public interface OtpService {
    String generateOtp(String key);

    boolean validateOtp(String key, String otp);

    // New methods for different OTP types
    String generateAccountActivationOtp(String email);

    String generatePasswordResetOtp(String email);

    boolean validateAccountActivationOtp(String email, String otp);

    boolean validatePasswordResetOtp(String email, String otp);
}
