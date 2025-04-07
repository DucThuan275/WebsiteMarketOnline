package com.chuyendeweb2.group05.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDTO {
    private Long id;
    private Integer userId;
    private String userName;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal productPrice;
    private LocalDateTime createdAt;
}