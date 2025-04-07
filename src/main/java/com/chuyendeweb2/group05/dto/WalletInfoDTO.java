package com.chuyendeweb2.group05.dto;

import java.math.BigDecimal;

public class WalletInfoDTO {

    private String userName;
    private BigDecimal balance; // Số dư ví
    private String userEmail; // Email của người dùng (có thể thay đổi theo yêu cầu)

    // Constructor, Getter và Setter

    public WalletInfoDTO(String userName, BigDecimal balance, String userEmail) {
        this.userName = userName;
        this.balance = balance;
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
