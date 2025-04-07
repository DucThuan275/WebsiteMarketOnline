package com.chuyendeweb2.group05.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductWithImagesResponseDTO {
    private ProductResponseDTO product;
    private List<ProductImageDTO> images;
}