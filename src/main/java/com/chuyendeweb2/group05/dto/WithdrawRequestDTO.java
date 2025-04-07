package com.chuyendeweb2.group05.dto;

import java.math.BigDecimal;

public class WithdrawRequestDTO {

    private BigDecimal amount;

    // Getter và Setter
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
