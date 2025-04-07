package com.chuyendeweb2.group05.entity.meta;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "otps")
public class OtpEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String email;
    private String otp;
    private LocalDateTime expiryTime;
    private boolean used;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}

