package com.chuyendeweb2.group05.dto;

import lombok.Getter;

import java.math.BigDecimal;

import com.chuyendeweb2.group05.entity.meta.Product;

@Getter
public class ProductListResponseDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private int stockQuantity;
    private String imageUrl;

    public ProductListResponseDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.price = product.getPrice();
        this.stockQuantity = product.getStockQuantity();
        this.imageUrl = product.getImageUrl();
    }
}