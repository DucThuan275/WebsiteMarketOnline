package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.entity.meta.VerificationToken;
import com.chuyendeweb2.group05.repo.VerificationTokenRepository;
import com.chuyendeweb2.group05.service.VerificationTokenService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenServiceImpl implements VerificationTokenService {

    private final VerificationTokenRepository tokenRepository;

    @Override
    @Transactional
    public String generateVerificationToken(User user, VerificationToken.TokenPurpose purpose) {
        // Delete any existing tokens for this user and purpose
        Optional<VerificationToken> existingToken = tokenRepository.findByUserIdAndPurpose(user.getId(), purpose);
        existingToken.ifPresent(tokenRepository::delete);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        
        // Set expiry based on purpose
        LocalDateTime expiryDate;
        if (purpose == VerificationToken.TokenPurpose.ACCOUNT_ACTIVATION) {
            expiryDate = LocalDateTime.now().plusHours(24); // 24 hours for account activation
        } else {
            expiryDate = LocalDateTime.now().plusHours(1); // 1 hour for password reset
        }
        
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .purpose(purpose)
                .build();
        
        tokenRepository.save(verificationToken);
        
        return token;
    }

    @Override
    public VerificationToken validateToken(String token) {
        Optional<VerificationToken> verificationToken = tokenRepository.findByToken(token);
        
        if (verificationToken.isEmpty() || verificationToken.get().isExpired()) {
            return null;
        }
        
        return verificationToken.get();
    }

    @Override
    @Transactional
    public void deleteToken(VerificationToken token) {
        tokenRepository.delete(token);
    }
}

