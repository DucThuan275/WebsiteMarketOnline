package com.chuyendeweb2.group05.repo;

import com.chuyendeweb2.group05.entity.meta.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Integer> {
    Optional<VerificationToken> findByToken(String token);

    Optional<VerificationToken> findByUserIdAndPurpose(Integer userId, VerificationToken.TokenPurpose purpose);

    void deleteByUserIdAndPurpose(Integer userId, VerificationToken.TokenPurpose purpose);
}