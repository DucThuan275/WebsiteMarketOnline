package com.chuyendeweb2.group05.service;

import com.chuyendeweb2.group05.dto.ProductImageDTO;

import java.util.List;

public interface ProductImageService {
    /**
     * Add a new image to a product
     * 
     * @param productId The ID of the product to add the image to
     * @param filename  The filename of the saved image
     * @param url       The URL to access the image
     * @param isPrimary Whether this is the primary image for the product
     * @return The created product image DTO
     */
    ProductImageDTO addProductImage(Long productId, String filename, String url, Boolean isPrimary);

    /**
     * Get all images for a product
     * 
     * @param productId The ID of the product
     * @return List of product image DTOs
     */
    List<ProductImageDTO> getProductImages(Long productId);

    /**
     * Get a specific product image by ID
     * 
     * @param imageId The ID of the image
     * @return The product image DTO
     */
    ProductImageDTO getProductImageById(Long imageId);

    /**
     * Delete a product image
     * 
     * @param imageId The ID of the image to delete
     */
    void deleteProductImage(Long imageId);

    /**
     * Set an image as the primary image for a product
     * 
     * @param imageId The ID of the image to set as primary
     * @return The updated product image DTO
     */
    ProductImageDTO setPrimaryImage(Long imageId);
}