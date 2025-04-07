package com.chuyendeweb2.group05.dto;

import lombok.Getter;

import java.math.BigDecimal;

import com.chuyendeweb2.group05.entity.meta.Product;

@Getter
public class ProductDetailResponseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String imageUrl;
    private Long categoryId;

    public ProductDetailResponseDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.stockQuantity = product.getStockQuantity();
        this.imageUrl = product.getImageUrl();
        this.categoryId = product.getCategory().getId();
    }

}
