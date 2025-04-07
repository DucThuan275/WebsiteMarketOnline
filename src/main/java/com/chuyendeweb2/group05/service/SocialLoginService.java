package com.chuyendeweb2.group05.service;

import com.chuyendeweb2.group05.dto.AuthenticationResponse;
import com.chuyendeweb2.group05.dto.SocialLoginRequest;

public interface SocialLoginService {
    AuthenticationResponse loginWithGoogle(String token);
    AuthenticationResponse loginWithFacebook(String token);
    AuthenticationResponse processSocialLogin(SocialLoginRequest request);
}

