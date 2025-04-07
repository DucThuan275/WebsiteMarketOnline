package com.chuyendeweb2.group05.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WebsiteRevenueDTO {
    private Long id;
    private Long orderId;
    private Long productId;
    private Long sellerId;
    private String sellerEmail;
    private BigDecimal amount;
    private String description;
    private LocalDateTime createdAt;
}
