package com.chuyendeweb2.group05.service;

import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.entity.meta.VerificationToken;

public interface VerificationTokenService {
    String generateVerificationToken(User user, VerificationToken.TokenPurpose purpose);

    VerificationToken validateToken(String token);

    void deleteToken(VerificationToken token);
}