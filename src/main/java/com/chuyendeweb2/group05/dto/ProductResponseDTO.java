package com.chuyendeweb2.group05.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.chuyendeweb2.group05.enums.ProductStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String imageUrl;
    private ProductStatus status;

    private Long categoryId;
    private String categoryName;

    private Integer sellerId;
    private String sellerName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    private Integer approvedById;
    private String approvedByName;

    private Double averageRating;
    private Integer reviewCount;
    private Integer favoriteCount;
    private List<ProductImageDTO> images; // This line should be here
}