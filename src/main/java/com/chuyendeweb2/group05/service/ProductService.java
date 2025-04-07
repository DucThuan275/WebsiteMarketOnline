package com.chuyendeweb2.group05.service;

import java.io.IOException;
import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.chuyendeweb2.group05.dto.ProductCreateRequestDTO;
import com.chuyendeweb2.group05.dto.ProductResponseDTO;
import com.chuyendeweb2.group05.dto.ProductUpdateRequestDTO;
import com.chuyendeweb2.group05.enums.ProductStatus;

public interface ProductService {

        // ProductService
        ProductResponseDTO createProduct(ProductCreateRequestDTO requestDTO, Integer userId, MultipartFile imageFile)
                        throws IOException;

        default ProductResponseDTO createProduct(ProductCreateRequestDTO requestDTO, Integer userId) {
                try {
                        return createProduct(requestDTO, userId, null);
                } catch (IOException e) {
                        throw new RuntimeException("Error processing product creation", e);
                }
        }

        /**
         * Retrieves related products based on various criteria.
         * 
         * @param productId  The ID of the reference product to find related products
         * @param limit      Maximum number of related products to return
         * @param categoryId Optional category filter for related products
         * @param pageable   Pagination and sorting information
         * @return Page of related ProductResponseDTO
         */
        Page<ProductResponseDTO> getRelatedProducts(
                        Long productId,
                        int limit,
                        Long categoryId,
                        Pageable pageable);

        // Get a product by id
        ProductResponseDTO getProductById(Long id);

        // Get all active products (paginated, searchable, sortable)
        Page<ProductResponseDTO> getActiveProducts(
                        String keyword,
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable);

        // Get all products with filtering, sorting, and pagination
        Page<ProductResponseDTO> getAllProducts(
                        String keyword,
                        ProductStatus status,
                        Long categoryId,
                        Integer sellerId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable);

        // New methods
        Page<ProductResponseDTO> getProductNew(int limit, Pageable pageable);

        Page<ProductResponseDTO> getProductByCategory(
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable);

        // Get products by seller (paginated, searchable, sortable)
        Page<ProductResponseDTO> getProductsBySeller(
                        Integer sellerId,
                        String keyword,
                        Long categoryId,
                        ProductStatus status,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable);
        // Add this method to the ProductService interface

        /**
         * Search for products with attachments based on various criteria.
         * 
         * @param keyword   Optional keyword to search in product name and description
         * @param productId Optional product ID to filter by specific product
         * @param fileType  Optional file type to filter attachments (e.g., "jpg",
         *                  "pdf")
         * @param pageable  Pagination and sorting information
         * @return Page of ProductResponseDTO matching the search criteria
         */
        Page<ProductResponseDTO> searchProductAttachment(
                        String keyword,
                        Long productId,
                        String fileType,
                        Pageable pageable);

        Page<ProductResponseDTO> getActiveProductsBySeller(
                        Integer sellerId,
                        String keyword,
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable);

        // Update product with image handling
        ProductResponseDTO updateProduct(Long productId, ProductUpdateRequestDTO requestDTO, Integer userId,
                        MultipartFile imageFile) throws IOException;

        // Update product without image (for backward compatibility)
        default ProductResponseDTO updateProduct(Long productId, ProductUpdateRequestDTO requestDTO, Integer userId) {
                try {
                        return updateProduct(productId, requestDTO, userId, null);
                } catch (IOException e) {
                        throw new RuntimeException("Error processing product update", e);
                }
        }

        // Delete product (only for product owner or admin)
        void deleteProduct(Long productId, Integer userId);

        // Admin approve product
        ProductResponseDTO approveProduct(Long productId, Integer adminId);

        // Admin reject/deactivate product
        ProductResponseDTO deactivateProduct(Long productId, Integer adminId);

        // Get pending products (for admin) - paginated, searchable, sortable
        Page<ProductResponseDTO> getPendingProducts(
                        String keyword,
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable);
}