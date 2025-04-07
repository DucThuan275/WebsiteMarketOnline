package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.chuyendeweb2.group05.service.EmailService;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP code is: " + otp + "\nThis code will expire in 5 minutes.");

        try {
            mailSender.send(message);
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", to, e);
        }
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Activate Your Account");
        message.setText("Please click the link below to activate your account:\n"
                + baseUrl + "/api/v1/auth/activate?token=" + token
                + "\n\nThis link will expire in 24 hours.");

        try {
            mailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Reset Your Password");
        message.setText("Please click the link below to reset your password:\n"
                + baseUrl + "/api/v1/auth/reset-password?token=" + token
                + "\n\nThis link will expire in 1 hour.");

        try {
            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
        }
    }

    @Override
    public void sendAccountActivationOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Activate Your Account");
        message.setText("Your account activation code is: " + otp +
                "\n\nPlease use this code to activate your account." +
                "\nThis code will expire in 24 hours.");

        try {
            mailSender.send(message);
            log.info("Account activation OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send account activation OTP email to: {}", to, e);
        }
    }

    @Override
    public void sendPasswordResetOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Reset Your Password");
        message.setText("Your password reset code is: " + otp +
                "\n\nPlease use this code to reset your password." +
                "\nThis code will expire in 1 hour.");

        try {
            mailSender.send(message);
            log.info("Password reset OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to: {}", to, e);
        }
    }
}
