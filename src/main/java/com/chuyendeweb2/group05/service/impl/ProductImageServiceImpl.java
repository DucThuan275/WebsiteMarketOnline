package com.chuyendeweb2.group05.service.impl;

import com.chuyendeweb2.group05.dto.ProductImageDTO;
import com.chuyendeweb2.group05.dto.ProductResponseDTO;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.ProductImage;
import com.chuyendeweb2.group05.exception.ResourceNotFoundException;
import com.chuyendeweb2.group05.repo.ProductImageRepository;
import com.chuyendeweb2.group05.repo.ProductRepository;
import com.chuyendeweb2.group05.service.ProductImageService;
import com.chuyendeweb2.group05.service.ProductImageStorageService;
import com.chuyendeweb2.group05.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductImageServiceImpl implements ProductImageService {

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductService productService;

    @Autowired
    private ProductImageStorageService storageService;

    @Override
    @Transactional
    public ProductImageDTO addProductImage(Long productId, String filename, String url, Boolean isPrimary) {
        // Get the actual Product entity directly
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Create the product image entity
        ProductImage productImage = ProductImage.builder()
                .product(product)
                .filename(filename)
                .url(url)
                .isPrimary(isPrimary)
                .build();

        // If this is set as primary, update product's primary image URL
        if (isPrimary) {
            // First, unset any existing primary images
            List<ProductImage> primaryImages = productImageRepository.findByProductIdAndIsPrimaryTrue(productId);
            primaryImages.forEach(img -> {
                img.setIsPrimary(false);
                productImageRepository.save(img);
            });

            // Set this as the primary image and update product's imageUrl
            product.setImageUrl(url);
            productRepository.save(product);
        }

        // Add image to product's collection and save
        product.getImages().add(productImage);
        ProductImage savedImage = productImageRepository.save(productImage);

        return mapToDTO(savedImage);
    }

    @Override
    public List<ProductImageDTO> getProductImages(Long productId) {
        List<ProductImage> images = productImageRepository.findByProductId(productId);
        return images.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public ProductImageDTO getProductImageById(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product Image not found"));
        return mapToDTO(image);
    }

    @Override
    @Transactional
    public void deleteProductImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product Image not found"));

        // Delete from storage first
        storageService.delete(image.getFilename());

        // If it's the primary image, we need to handle that case
        if (image.getIsPrimary() && !image.getProduct().getImages().isEmpty()) {
            // Find another image to make primary if there are other images
            List<ProductImage> otherImages = image.getProduct().getImages().stream()
                    .filter(img -> !img.getId().equals(imageId))
                    .collect(Collectors.toList());

            if (!otherImages.isEmpty()) {
                ProductImage newPrimary = otherImages.get(0);
                newPrimary.setIsPrimary(true);
                image.getProduct().setImageUrl(newPrimary.getUrl());
                productImageRepository.save(newPrimary);
            } else {
                // No other images, clear the primary image URL
                image.getProduct().setImageUrl(null);
            }
        }

        // Remove from product and delete
        image.getProduct().removeImage(image);
        productImageRepository.delete(image);
    }

    @Override
    @Transactional
    public ProductImageDTO setPrimaryImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product Image not found"));

        // Set as primary in the product
        image.getProduct().setPrimaryImage(image);

        // Save and return
        ProductImage savedImage = productImageRepository.save(image);
        return mapToDTO(savedImage);
    }

    private ProductImageDTO mapToDTO(ProductImage image) {
        return ProductImageDTO.builder()
                .id(image.getId())
                .productId(image.getProduct().getId())
                .filename(image.getFilename())
                .url(image.getUrl())
                .isPrimary(image.getIsPrimary())
                .createdAt(image.getCreatedAt())
                .build();
    }
}