package com.chuyendeweb2.group05.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawalRequest {
    private BigDecimal amount;
    private String bankCode;
}