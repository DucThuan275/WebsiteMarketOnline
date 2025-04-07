package com.chuyendeweb2.group05.controller;

import com.chuyendeweb2.group05.dto.ProductImageDTO;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.service.ProductImageService;
import com.chuyendeweb2.group05.service.ProductImageStorageService;
import com.chuyendeweb2.group05.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-images")
@Tag(name = "Product Images", description = "API for managing product images")
public class ProductImageController {

    @Autowired
    private ProductImageStorageService storageService;

    @Autowired
    private ProductImageService productImageService;

    @Autowired
    private ProductService productService;

    @PostMapping("/upload/{productId}")
    @Operation(summary = "Upload a product image", description = "Upload an image for a specific product")
    public ResponseEntity<ProductImageDTO> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary,
            @AuthenticationPrincipal User currentUser) {

        try {
            // Verify product exists and user has permission (product owner or admin)
            productService.getProductById(productId);

            // TODO: Add permission check here if needed

            // Save file to storage
            String filename = storageService.save(file);
            String url = storageService.getImageUrl(filename);

            // Create and save the product image
            ProductImageDTO savedImage = productImageService.addProductImage(
                    productId, filename, url, isPrimary);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
        } catch (Exception e) {
            throw new RuntimeException("Could not upload the image: " + e.getMessage(), e);
        }
    }

    @GetMapping("/get-image/{filename:.+}")
    @Operation(summary = "Get product image", description = "Get a product image by filename")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Resource file = storageService.load(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.IMAGE_JPEG) // Adjust content type based on your needs
                .body(file);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get product images", description = "Get all images for a specific product")
    public ResponseEntity<List<ProductImageDTO>> getProductImages(@PathVariable Long productId) {
        List<ProductImageDTO> images = productImageService.getProductImages(productId);
        return ResponseEntity.ok(images);
    }

    @DeleteMapping("/{imageId}")
    @Operation(summary = "Delete product image", description = "Delete a product image by ID")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal User currentUser) {

        // TODO: Add permission check here if needed

        productImageService.deleteProductImage(imageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{imageId}/primary")
    @Operation(summary = "Set primary image", description = "Set a product image as the primary image")
    public ResponseEntity<ProductImageDTO> setPrimaryImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal User currentUser) {

        // TODO: Add permission check here if needed

        ProductImageDTO updatedImage = productImageService.setPrimaryImage(imageId);
        return ResponseEntity.ok(updatedImage);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException e) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("File is too large!");
    }
}