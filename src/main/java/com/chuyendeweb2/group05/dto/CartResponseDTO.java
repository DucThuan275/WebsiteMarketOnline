package com.chuyendeweb2.group05.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {
    private Long id;
    private Integer userId;
    private String userName;
    private BigDecimal totalAmount;
    private int totalItems;
    private List<CartItemResponseDTO> items;
}
