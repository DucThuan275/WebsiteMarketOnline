package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.chuyendeweb2.group05.service.EmailService;
import com.chuyendeweb2.group05.service.OtpService;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final Map<String, OtpData> otpMap = new HashMap<>();
    private final EmailService emailService;
    private static final long OTP_VALID_DURATION = 5 * 60 * 1000; // 5 minutes
    private static final long PASSWORD_RESET_OTP_VALID_DURATION = 60 * 60 * 1000; // 1 hour
    private static final long ACCOUNT_ACTIVATION_OTP_VALID_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    @Override
    public String generateOtp(String key) {
        String otp = generateRandomOtp(6);
        OtpData otpData = new OtpData(otp, System.currentTimeMillis(), OTP_VALID_DURATION);
        otpMap.put(key, otpData);

        // Send OTP via email
        emailService.sendOtpEmail(key, otp);

        return otp;
    }

    @Override
    public boolean validateOtp(String key, String otp) {
        if (key == null || otp == null) {
            return false;
        }

        OtpData otpData = otpMap.get(key);
        if (otpData == null) {
            return false;
        }

        // Check if OTP is expired
        if (System.currentTimeMillis() > otpData.getExpiryTime()) {
            otpMap.remove(key);
            return false;
        }

        // Check if OTP matches
        if (!otp.equals(otpData.getOtp())) {
            return false;
        }

        // OTP is valid, remove it from map
        otpMap.remove(key);
        return true;
    }

    @Override
    public String generateAccountActivationOtp(String email) {
        String otp = generateRandomOtp(6);
        OtpData otpData = new OtpData(otp, System.currentTimeMillis(), ACCOUNT_ACTIVATION_OTP_VALID_DURATION);
        String key = "ACTIVATION:" + email;
        otpMap.put(key, otpData);

        // Send activation OTP via email
        emailService.sendAccountActivationOtp(email, otp);

        return otp;
    }

    @Override
    public String generatePasswordResetOtp(String email) {
        String otp = generateRandomOtp(6);
        OtpData otpData = new OtpData(otp, System.currentTimeMillis(), PASSWORD_RESET_OTP_VALID_DURATION);
        String key = "RESET:" + email;
        otpMap.put(key, otpData);

        // Send password reset OTP via email
        emailService.sendPasswordResetOtp(email, otp);

        return otp;
    }

    @Override
    public boolean validateAccountActivationOtp(String email, String otp) {
        String key = "ACTIVATION:" + email;
        return validateOtp(key, otp);
    }

    @Override
    public boolean validatePasswordResetOtp(String email, String otp) {
        String key = "RESET:" + email;
        return validateOtp(key, otp);
    }

    private String generateRandomOtp(int length) {
        StringBuilder otp = new StringBuilder();
        SecureRandom random = new SecureRandom();

        for (int i = 0; i < length; i++) {
            otp.append(random.nextInt(10));
        }

        return otp.toString();
    }

    private static class OtpData {
        private final String otp;
        private final long creationTime;
        private final long validDuration;

        public OtpData(String otp, long creationTime, long validDuration) {
            this.otp = otp;
            this.creationTime = creationTime;
            this.validDuration = validDuration;
        }

        public String getOtp() {
            return otp;
        }

        public long getExpiryTime() {
            return creationTime + validDuration;
        }
    }
}
