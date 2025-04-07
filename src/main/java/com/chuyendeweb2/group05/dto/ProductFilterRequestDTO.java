package com.chuyendeweb2.group05.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.chuyendeweb2.group05.enums.ProductStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequestDTO {
    private Integer categoryId;
    private ProductStatus status;
    private String searchTerm;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}