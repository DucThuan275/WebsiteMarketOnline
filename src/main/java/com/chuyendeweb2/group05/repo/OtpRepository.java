package com.chuyendeweb2.group05.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.OtpEntity;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpEntity, Integer> {
    Optional<OtpEntity> findByEmailAndOtpAndUsedFalse(String email, String otp);
}

