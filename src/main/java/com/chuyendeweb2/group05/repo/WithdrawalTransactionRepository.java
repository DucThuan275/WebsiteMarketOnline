package com.chuyendeweb2.group05.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.WithdrawalTransaction;

import java.util.Optional;

@Repository
public interface WithdrawalTransactionRepository extends JpaRepository<WithdrawalTransaction, Long> {
    Optional<WithdrawalTransaction> findByTransactionCode(String transactionCode);
}