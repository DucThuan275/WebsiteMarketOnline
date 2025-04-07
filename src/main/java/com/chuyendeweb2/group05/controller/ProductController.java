package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.chuyendeweb2.group05.dto.ProductCreateRequestDTO;
import com.chuyendeweb2.group05.dto.ProductResponseDTO;
import com.chuyendeweb2.group05.dto.ProductUpdateRequestDTO;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.ProductStatus;
import com.chuyendeweb2.group05.service.ProductImageService;
import com.chuyendeweb2.group05.service.ProductImageStorageService;
import com.chuyendeweb2.group05.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "APIs for managing products")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

        private final ProductService productService;
        private final ProductImageService productImageService;
        private final ProductImageStorageService productImageStorageService;

        @GetMapping("/search")
        public ResponseEntity<Page<ProductResponseDTO>> searchProductAttachments(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) Long productId,
                        @RequestParam(required = false) String fileType,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "id") String sortField,
                        @RequestParam(defaultValue = "asc") String sortDir) {

                Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                                ? Sort.by(sortField).ascending()
                                : Sort.by(sortField).descending();

                Pageable pageable = PageRequest.of(page, size, sort);

                Page<ProductResponseDTO> result = productService.searchProductAttachment(
                                keyword, productId, fileType, pageable);

                return ResponseEntity.ok(result);
        }

        @GetMapping("/active")
        @Operation(summary = "Get all active products", description = "Retrieve all products with status ACTIVE with pagination, sorting and filtering")
        public ResponseEntity<Page<ProductResponseDTO>> getActiveProducts(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        @RequestParam(required = false) Integer minStock,
                        @RequestParam(required = false) Integer maxStock,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "id") String sortField,
                        @RequestParam(defaultValue = "asc") String sortDirection) {

                Sort sort = Sort.by(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                                sortField);
                Pageable pageable = PageRequest.of(page, size, sort);

                return ResponseEntity.ok(productService.getActiveProducts(
                                keyword, categoryId, minPrice, maxPrice, minStock, maxStock, pageable));
        }

        @PostMapping
        @Operation(summary = "Create a new product", description = "Create a new product that will be in PENDING status until approved by an admin")
        public ResponseEntity<ProductResponseDTO> createProduct(
                        @RequestParam("requestDTO") String requestDTO,
                        @RequestParam(value = "image", required = false) MultipartFile primaryImage,
                        @RequestParam(value = "additionalImages", required = false) MultipartFile[] additionalImages,
                        @AuthenticationPrincipal User currentUser) throws IOException {

                try {
                        // Convert JSON string to ProductCreateRequestDTO
                        ObjectMapper objectMapper = new ObjectMapper();
                        objectMapper.registerModule(new JavaTimeModule()); // For proper date/time handling
                        ProductCreateRequestDTO productCreateRequestDTO = objectMapper.readValue(requestDTO,
                                        ProductCreateRequestDTO.class);

                        // Create the product with primary image
                        ProductResponseDTO response = productService.createProduct(productCreateRequestDTO,
                                        currentUser.getId(), primaryImage);

                        // If additional images were provided, upload them
                        if (additionalImages != null && additionalImages.length > 0) {
                                for (int i = 0; i < additionalImages.length; i++) {
                                        MultipartFile file = additionalImages[i];
                                        if (!file.isEmpty()) {
                                                // Save file to storage
                                                String filename = productImageStorageService.save(file);
                                                String url = productImageStorageService.getImageUrl(filename);

                                                // Add as product image (not primary)
                                                productImageService.addProductImage(response.getId(), filename, url,
                                                                false);
                                        }
                                }

                                // Refresh product data to include the new images
                                response = productService.getProductById(response.getId());
                        }

                        return new ResponseEntity<>(response, HttpStatus.CREATED);
                } catch (Exception e) {
                        throw new RuntimeException("Error creating product: " + e.getMessage(), e);
                }
        }

        // For backward compatibility - JSON body version
        @PostMapping("/json")
        @Operation(summary = "Create a new product using JSON", description = "Create a new product with JSON payload (without image upload)")
        public ResponseEntity<ProductResponseDTO> createProductJson(
                        @Valid @RequestBody ProductCreateRequestDTO requestDTO,
                        @AuthenticationPrincipal User currentUser) {
                ProductResponseDTO response = productService.createProduct(requestDTO, currentUser.getId());
                return new ResponseEntity<>(response, HttpStatus.CREATED);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get product by ID", description = "Retrieve a product by its ID")
        public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
                return ResponseEntity.ok(productService.getProductById(id));
        }

        @GetMapping
        @Operation(summary = "Get all products", description = "Retrieve all products with optional filtering, pagination and sorting")
        public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(
                        @Parameter(description = "Search keyword for name or description") @RequestParam(required = false) String keyword,

                        @Parameter(description = "Filter by product status") @RequestParam(required = false) ProductStatus status,

                        @Parameter(description = "Filter by category ID") @RequestParam(required = false) Long categoryId,

                        @Parameter(description = "Filter by seller ID") @RequestParam(required = false) Integer sellerId,

                        @Parameter(description = "Filter by minimum price") @RequestParam(required = false) BigDecimal minPrice,

                        @Parameter(description = "Filter by maximum price") @RequestParam(required = false) BigDecimal maxPrice,

                        @Parameter(description = "Filter by minimum stock quantity") @RequestParam(required = false) Integer minStock,

                        @Parameter(description = "Filter by maximum stock quantity") @RequestParam(required = false) Integer maxStock,

                        @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,

                        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,

                        @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortField,

                        @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "asc") String sortDirection) {

                Sort sort = Sort.by(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                                sortField);
                Pageable pageable = PageRequest.of(page, size, sort);

                return ResponseEntity.ok(productService.getAllProducts(
                                keyword, status, categoryId, sellerId, minPrice, maxPrice, minStock, maxStock,
                                pageable));
        }

        @GetMapping("/my-active-products")
        @Operation(summary = "Get current user's products", description = "Retrieve all active products created by the current user with filtering, pagination, and sorting")
        public ResponseEntity<Page<ProductResponseDTO>> getMyActiveProducts(
                        @AuthenticationPrincipal User currentUser,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        @RequestParam(required = false) Integer minStock,
                        @RequestParam(required = false) Integer maxStock,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "id") String sortField,
                        @RequestParam(defaultValue = "asc") String sortDirection) {

                Sort sort = Sort.by(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                                sortField);
                Pageable pageable = PageRequest.of(page, size, sort);

                return ResponseEntity.ok(productService.getActiveProductsBySeller(
                                currentUser.getId(), keyword, categoryId, minPrice, maxPrice, minStock, maxStock,
                                pageable));
        }

        @GetMapping("/my-products")
        @Operation(summary = "Get current user's products", description = "Retrieve all products created by the current user with filtering, pagination and sorting")
        public ResponseEntity<Page<ProductResponseDTO>> getMyProducts(
                        @AuthenticationPrincipal User currentUser,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) ProductStatus status,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        @RequestParam(required = false) Integer minStock,
                        @RequestParam(required = false) Integer maxStock,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "id") String sortField,
                        @RequestParam(defaultValue = "asc") String sortDirection) {

                Sort sort = Sort.by(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                                sortField);
                Pageable pageable = PageRequest.of(page, size, sort);

                return ResponseEntity.ok(productService.getProductsBySeller(
                                currentUser.getId(), keyword, categoryId, status, minPrice, maxPrice, minStock,
                                maxStock, pageable));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Update product", description = "Update an existing product (only owner or admin)")
        public ResponseEntity<ProductResponseDTO> updateProduct(
                        @PathVariable Long id,
                        @Valid @ModelAttribute ProductUpdateRequestDTO requestDTO,
                        @RequestParam(value = "image", required = false) MultipartFile imageFile,
                        @AuthenticationPrincipal User currentUser) throws IOException {
                return ResponseEntity.ok(productService.updateProduct(id, requestDTO, currentUser.getId(), imageFile));
        }

        // For backward compatibility - JSON body version
        @PutMapping("/{id}/json")
        @Operation(summary = "Update product using JSON", description = "Update an existing product with JSON payload (without image upload)")
        public ResponseEntity<ProductResponseDTO> updateProductJson(
                        @PathVariable Long id,
                        @Valid @RequestBody ProductUpdateRequestDTO requestDTO,
                        @AuthenticationPrincipal User currentUser) {
                return ResponseEntity.ok(productService.updateProduct(id, requestDTO, currentUser.getId()));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete product", description = "Delete a product (only owner or admin)")
        public ResponseEntity<Void> deleteProduct(
                        @PathVariable Long id,
                        @AuthenticationPrincipal User currentUser) {
                productService.deleteProduct(id, currentUser.getId());
                return ResponseEntity.noContent().build();
        }

        @PutMapping("/{id}/approve")
        @PreAuthorize("hasAuthority('ADMIN')")
        @Operation(summary = "Approve product", description = "Approve a product (admin only)")
        public ResponseEntity<ProductResponseDTO> approveProduct(
                        @PathVariable Long id,
                        @AuthenticationPrincipal User currentUser) {
                return ResponseEntity.ok(productService.approveProduct(id, currentUser.getId()));
        }

        @PutMapping("/{id}/deactivate")
        @PreAuthorize("hasAuthority('ADMIN')")
        @Operation(summary = "Deactivate product", description = "Deactivate a product (admin only)")
        public ResponseEntity<ProductResponseDTO> deactivateProduct(
                        @PathVariable Long id,
                        @AuthenticationPrincipal User currentUser) {
                return ResponseEntity.ok(productService.deactivateProduct(id, currentUser.getId()));
        }

        @GetMapping("/pending")
        @PreAuthorize("hasAuthority('ADMIN')")
        @Operation(summary = "Get pending products", description = "Get all products that are pending approval with filtering, pagination and sorting (admin only)")
        public ResponseEntity<Page<ProductResponseDTO>> getPendingProducts(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        @RequestParam(required = false) Integer minStock,
                        @RequestParam(required = false) Integer maxStock,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "id") String sortField,
                        @RequestParam(defaultValue = "asc") String sortDirection) {

                Sort sort = Sort.by(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                                sortField);
                Pageable pageable = PageRequest.of(page, size, sort);

                return ResponseEntity.ok(productService.getPendingProducts(
                                keyword, categoryId, minPrice, maxPrice, minStock, maxStock, pageable));
        }

        @GetMapping("/related/{productId}")
        @Operation(summary = "Get related products", description = "Retrieve products related to a specific product")
        public ResponseEntity<Page<ProductResponseDTO>> getRelatedProducts(
                        @PathVariable Long productId,
                        @RequestParam(defaultValue = "5") int limit,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "createdAt") String sortField,
                        @RequestParam(defaultValue = "desc") String sortDirection) {

                Sort sort = Sort.by(
                                sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                                sortField);

                Pageable pageable = PageRequest.of(page, size, sort);
                Page<ProductResponseDTO> relatedProducts = productService.getRelatedProducts(
                                productId, limit, categoryId, pageable);

                return ResponseEntity.ok(relatedProducts);
        }

        @GetMapping("/new")
        public ResponseEntity<Page<ProductResponseDTO>> getNewProducts(
                        @RequestParam(defaultValue = "10") int limit,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "createdAt") String sortBy,
                        @RequestParam(defaultValue = "desc") String direction) {

                Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();

                Pageable pageable = PageRequest.of(page, size, sort);

                Page<ProductResponseDTO> newProducts = productService.getProductNew(limit, pageable);

                return ResponseEntity.ok(newProducts);
        }

        @GetMapping("/category/{categoryId}")
        public ResponseEntity<Page<ProductResponseDTO>> getProductsByCategory(
                        @PathVariable Long categoryId,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        @RequestParam(required = false) Integer minStock,
                        @RequestParam(required = false) Integer maxStock,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(defaultValue = "id") String sortBy,
                        @RequestParam(defaultValue = "desc") String direction) {

                Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();

                Pageable pageable = PageRequest.of(page, size, sort);

                try {
                        Page<ProductResponseDTO> categoryProducts = productService.getProductByCategory(
                                        categoryId, minPrice, maxPrice, minStock, maxStock, pageable);

                        return ResponseEntity.ok(categoryProducts);
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().build();
                }
        }

        private Pageable createPageable(int page, int size, String[] sort) {
                // Check for valid page and size
                if (page < 0) {
                        page = 0;
                }
                if (size <= 0) {
                        size = 10;
                }

                // Create sort object from sort strings
                List<Sort.Order> orders = new ArrayList<>();

                if (sort.length > 0) {
                        for (String sortParam : sort) {
                                if (sortParam.contains(",")) {
                                        String[] parts = sortParam.split(",");
                                        String property = parts[0];

                                        Sort.Direction direction = Sort.Direction.ASC;
                                        if (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) {
                                                direction = Sort.Direction.DESC;
                                        }

                                        orders.add(new Sort.Order(direction, property));
                                } else {
                                        // If no direction specified, use ascending by default
                                        orders.add(new Sort.Order(Sort.Direction.ASC, sortParam));
                                }
                        }
                }

                return PageRequest.of(page, size, orders.isEmpty() ? Sort.unsorted() : Sort.by(orders));
        }

        private List<Sort.Order> createSortOrders(String[] sort) {
                return Arrays.stream(sort)
                                .map(s -> {
                                        String[] parts = s.split(",");
                                        if (parts.length == 2) {
                                                return new Sort.Order(Sort.Direction.fromString(parts[1]), parts[0]);
                                        } else {
                                                return new Sort.Order(Sort.Direction.ASC, parts[0]); // Mặc định ASC nếu
                                                                                                     // không có hướng
                                        }
                                })
                                .collect(Collectors.toList());
        }

}