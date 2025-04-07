package com.chuyendeweb2.group05.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productDescription;
    private String productImageUrl;
    private BigDecimal productPrice;
    private int quantity;
    private BigDecimal totalPrice;
    private int stockQuantity; // Cần thêm thông tin về số lượng trong kho
}
