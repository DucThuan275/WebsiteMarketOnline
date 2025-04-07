package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.chuyendeweb2.group05.dto.ProductCreateRequestDTO;
import com.chuyendeweb2.group05.dto.ProductImageDTO;
import com.chuyendeweb2.group05.dto.ProductResponseDTO;
import com.chuyendeweb2.group05.dto.ProductUpdateRequestDTO;
import com.chuyendeweb2.group05.entity.meta.Category;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.ProductStatus;
import com.chuyendeweb2.group05.enums.Role;
import com.chuyendeweb2.group05.exception.ResourceNotFoundException;
import com.chuyendeweb2.group05.exception.UnauthorizedException;
import com.chuyendeweb2.group05.repo.CategoryRepository;
import com.chuyendeweb2.group05.repo.ProductRepository;
import com.chuyendeweb2.group05.repo.UserRepository;
import com.chuyendeweb2.group05.service.ProductService;
import com.chuyendeweb2.group05.specification.ProductSpecification;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;
        @Value("${project.image}")
        private String uploadDir;

        @Override
        @Transactional
        public ProductResponseDTO createProduct(ProductCreateRequestDTO requestDTO, Integer userId,
                        MultipartFile imageFile) throws IOException {
                // Tìm user và category từ DB
                User seller = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                Category category = categoryRepository.findById(requestDTO.getCategoryId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found with id: " + requestDTO.getCategoryId()));

                Product product = Product.builder()
                                .name(requestDTO.getName())
                                .description(requestDTO.getDescription())
                                .price(requestDTO.getPrice())
                                .stockQuantity(requestDTO.getStockQuantity())
                                .category(category)
                                .seller(seller)
                                .status(ProductStatus.PENDING)
                                .build();

                // Handle primary image if provided
                if (imageFile != null && !imageFile.isEmpty()) {
                        String fileName = saveImage(imageFile);
                        product.setImageUrl(fileName);
                } else if (requestDTO.getImageUrl() != null && !requestDTO.getImageUrl().isEmpty()) {
                        product.setImageUrl(requestDTO.getImageUrl());
                }

                // Save the product first to get an ID
                product = productRepository.save(product);

                return mapToProductResponseDTO(product);
        }

        @Override
        public ProductResponseDTO getProductById(Long id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
                return mapToProductResponseDTO(product);
        }

        @Override
        public Page<ProductResponseDTO> getActiveProducts(
                        String keyword,
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable) {

                // Use specification to build the query
                Page<Product> productsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                keyword,
                                                ProductStatus.ACTIVE,
                                                categoryId,
                                                null,
                                                minPrice,
                                                maxPrice,
                                                minStock,
                                                maxStock),
                                pageable);

                return productsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        public Page<ProductResponseDTO> getProductNew(int limit, Pageable pageable) {
                // Create a pageable with the requested limit if provided
                Pageable limitedPageable = limit > 0 ? PageRequest.of(0, limit,
                                pageable.getSort().isEmpty() ? Sort.by(Sort.Direction.DESC, "createdAt")
                                                : pageable.getSort())
                                : pageable;

                // Use specification to find active products sorted by creation date
                Page<Product> newProductsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                null, // No category filter
                                                ProductStatus.ACTIVE, // Ensure products are ACTIVE
                                                null, // No price filter
                                                null, // No stock filter
                                                null, // No other filters
                                                null, // No other filters
                                                null, // No other filters
                                                null // No other filters
                                ),
                                limitedPageable);

                // Map to ProductResponseDTO
                return newProductsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        public Page<ProductResponseDTO> getRelatedProducts(
                        Long productId,
                        int limit,
                        Long categoryId,
                        Pageable pageable) {

                // Find the base product
                Product baseProduct = productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id: " + productId));

                // If category is not provided, use the base product's category
                if (categoryId == null) {
                        categoryId = baseProduct.getCategory().getId();
                }

                // Create a pageable with the requested limit
                Pageable limitedPageable = limit > 0
                                ? PageRequest.of(0, limit, pageable.getSort().isEmpty()
                                                ? Sort.by(Sort.Direction.DESC, "createdAt")
                                                : pageable.getSort())
                                : pageable;

                // Use specification to find related products
                Page<Product> relatedProductsPage = productRepository.findAll(
                                Specification.where(
                                                ProductSpecification.searchProducts(
                                                                null, // No keyword filter
                                                                ProductStatus.ACTIVE, // Only active products
                                                                categoryId, // Category filter
                                                                null, // No seller filter
                                                                null, // No min price filter
                                                                null, // No max price filter
                                                                null, // No min stock filter
                                                                null // No max stock filter
                                                )).and((root, query, criteriaBuilder) -> criteriaBuilder
                                                                .notEqual(root.get("id"), productId) // Exclude base
                                                                                                     // product
                                ),
                                limitedPageable);

                // Map to ProductResponseDTO
                return relatedProductsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        public Page<ProductResponseDTO> getProductByCategory(
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable) {

                // Validate categoryId
                if (categoryId == null) {
                        throw new IllegalArgumentException("Category ID is required");
                }

                // Use specification to find products by category and active status
                Page<Product> categoryProductsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                null, // No status filter, it will be filtered below as ACTIVE
                                                ProductStatus.ACTIVE, // Ensure products are ACTIVE
                                                categoryId, // Category filter
                                                null, // No other filters
                                                minPrice, // Min price filter
                                                maxPrice, // Max price filter
                                                minStock, // Min stock filter
                                                maxStock // Max stock filter
                                ),
                                pageable);

                // Map to ProductResponseDTO
                return categoryProductsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        public Page<ProductResponseDTO> getAllProducts(
                        String keyword,
                        ProductStatus status,
                        Long categoryId,
                        Integer sellerId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable) {

                // Use specification to build the query
                Page<Product> productsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                keyword,
                                                status,
                                                categoryId,
                                                sellerId,
                                                minPrice,
                                                maxPrice,
                                                minStock,
                                                maxStock),
                                pageable);

                return productsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        public Page<ProductResponseDTO> getProductsBySeller(
                        Integer sellerId,
                        String keyword,
                        Long categoryId,
                        ProductStatus status,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable) {

                User seller = userRepository.findById(sellerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with id: " + sellerId));

                // Use specification to build the query
                Page<Product> productsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                keyword,
                                                status,
                                                categoryId,
                                                sellerId,
                                                minPrice,
                                                maxPrice,
                                                minStock,
                                                maxStock),
                                pageable);

                return productsPage.map(this::mapToProductResponseDTO);
        }
        // Add this method to the ProductServiceImpl class

        @Override
        public Page<ProductResponseDTO> searchProductAttachment(
                        String keyword,
                        Long productId,
                        String fileType,
                        Pageable pageable) {

                // Validate that product exists if productId is provided
                if (productId != null) {
                        productRepository.findById(productId)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product not found with id: " + productId));
                }

                // Use specification to build the query for products with attachments
                Specification<Product> spec = Specification.where(null);

                // Add keyword search if provided
                if (keyword != null && !keyword.trim().isEmpty()) {
                        spec = spec.and((root, query, criteriaBuilder) -> {
                                // Search in product name and description
                                return criteriaBuilder.or(
                                                criteriaBuilder.like(
                                                                criteriaBuilder.lower(root.get("name")),
                                                                "%" + keyword.toLowerCase() + "%"),
                                                criteriaBuilder.like(
                                                                criteriaBuilder.lower(root.get("description")),
                                                                "%" + keyword.toLowerCase() + "%"));
                        });
                }

                // Filter by product ID if provided
                if (productId != null) {
                        spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("id"),
                                        productId));
                }

                // Only include active products
                spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"),
                                ProductStatus.ACTIVE));

                // Filter by file type if provided (assuming images collection has a type field)
                if (fileType != null && !fileType.trim().isEmpty()) {
                        spec = spec.and((root, query, criteriaBuilder) -> {
                                // Join with images collection
                                Join<Object, Object> imagesJoin = root.join("images", JoinType.INNER);

                                // Filter by file type
                                return criteriaBuilder.like(
                                                criteriaBuilder.lower(imagesJoin.get("url")),
                                                "%" + fileType.toLowerCase() + "%");
                        });
                }

                // Execute the query
                Page<Product> productsPage = productRepository.findAll(spec, pageable);

                // Map to ProductResponseDTO
                return productsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        public Page<ProductResponseDTO> getActiveProductsBySeller(
                        Integer sellerId,
                        String keyword,
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable) {

                User seller = userRepository.findById(sellerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with id: " + sellerId));

                // Use specification to build the query (chỉ lấy sản phẩm ACTIVE)
                Page<Product> productsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                keyword,
                                                ProductStatus.ACTIVE, // Luôn lọc theo trạng thái ACTIVE
                                                categoryId,
                                                sellerId,
                                                minPrice,
                                                maxPrice,
                                                minStock,
                                                maxStock),
                                pageable);

                return productsPage.map(this::mapToProductResponseDTO);
        }

        @Override
        @Transactional
        public ProductResponseDTO updateProduct(Long productId, ProductUpdateRequestDTO requestDTO, Integer userId,
                        MultipartFile imageFile) throws IOException {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id: " + productId));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                // Only the seller or an admin can update a product
                if (!product.getSeller().getId().equals(userId) && user.getRole() != Role.ADMIN) {
                        throw new UnauthorizedException("You don't have permission to update this product");
                }

                Category newCategory = categoryRepository.findById(requestDTO.getCategoryId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found with id: " + requestDTO.getCategoryId()));

                // Handle image update
                if (imageFile != null && !imageFile.isEmpty()) {
                        // Delete old image if exists
                        if (product.getImageUrl() != null && !product.getImageUrl().startsWith("http")) {
                                deleteImage(product.getImageUrl());
                        }

                        String fileName = saveImage(imageFile);
                        requestDTO.setImageUrl(fileName);
                }

                product.update(requestDTO, newCategory);
                product = productRepository.save(product);

                return mapToProductResponseDTO(product);
        }

        @Override
        @Transactional
        public void deleteProduct(Long productId, Integer userId) {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id: " + productId));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                // Only the seller or an admin can delete a product
                if (!product.getSeller().getId().equals(userId) && user.getRole() != Role.ADMIN) {
                        throw new UnauthorizedException("You don't have permission to delete this product");
                }

                // Delete product image
                if (product.getImageUrl() != null && !product.getImageUrl().startsWith("http")) {
                        deleteImage(product.getImageUrl());
                }

                productRepository.delete(product);
        }

        @Override
        @Transactional
        public ProductResponseDTO approveProduct(Long productId, Integer adminId) {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id: " + productId));

                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Admin not found with id: " + adminId));

                if (admin.getRole() != Role.ADMIN) {
                        throw new UnauthorizedException("Only admins can approve products");
                }

                product.activate(admin);
                product = productRepository.save(product);

                return mapToProductResponseDTO(product);
        }

        @Override
        @Transactional
        public ProductResponseDTO deactivateProduct(Long productId, Integer adminId) {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id: " + productId));

                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Admin not found with id: " + adminId));

                if (admin.getRole() != Role.ADMIN) {
                        throw new UnauthorizedException("Only admins can deactivate products");
                }

                product.deactivate();
                product = productRepository.save(product);

                return mapToProductResponseDTO(product);
        }

        @Override
        public Page<ProductResponseDTO> getPendingProducts(
                        String keyword,
                        Long categoryId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer minStock,
                        Integer maxStock,
                        Pageable pageable) {

                // Use specification to build the query
                Page<Product> pendingProductsPage = productRepository.findAll(
                                ProductSpecification.searchProducts(
                                                keyword,
                                                ProductStatus.PENDING,
                                                categoryId,
                                                null,
                                                minPrice,
                                                maxPrice,
                                                minStock,
                                                maxStock),
                                pageable);

                return pendingProductsPage.map(this::mapToProductResponseDTO);
        }

        // Helper method to map Product entity to ProductResponseDTO
        // In ProductServiceImpl class
        private ProductResponseDTO mapToProductResponseDTO(Product product) {
                return ProductResponseDTO.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .description(product.getDescription())
                                .price(product.getPrice())
                                .stockQuantity(product.getStockQuantity())
                                .imageUrl(product.getImageUrl())
                                .status(product.getStatus())
                                .categoryId(product.getCategory().getId())
                                .categoryName(product.getCategory().getName())
                                .sellerId(product.getSeller().getId())
                                .sellerName(product.getSeller().getFirstname() + " "
                                                + product.getSeller().getLastname())
                                .createdAt(product.getCreatedAt())
                                .updatedAt(product.getUpdatedAt())
                                .approvedAt(product.getApprovedAt())
                                .approvedById(product.getApprovedBy() != null ? product.getApprovedBy().getId() : null)
                                .approvedByName(product.getApprovedBy() != null
                                                ? product.getApprovedBy().getFirstname() + " "
                                                                + product.getApprovedBy().getLastname()
                                                : null)
                                .averageRating(product.getAverageRating())
                                .reviewCount(product.getReviewCount())
                                .favoriteCount(product.getFavoriteCount())
                                .images(product.getImages().stream()
                                                .map(img -> ProductImageDTO.builder()
                                                                .id(img.getId())
                                                                .url(img.getUrl())
                                                                .isPrimary(img.getIsPrimary())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .build();
        }

        private String saveImage(MultipartFile imageFile) throws IOException {
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                        if (!directory.mkdirs()) {
                                throw new IOException("Failed to create directory for image uploads");
                        }
                }

                String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);

                // Kiểm tra quyền ghi vào thư mục
                if (!Files.isWritable(filePath.getParent())) {
                        throw new IOException("Directory is not writable");
                }

                Files.copy(imageFile.getInputStream(), filePath);
                return fileName;
        }

        // Helper method to delete an image
        private void deleteImage(String fileName) {
                try {
                        Path filePath = Paths.get(uploadDir, fileName);
                        Files.deleteIfExists(filePath);
                } catch (IOException e) {
                        // Log the error but don't throw exception
                        System.err.println("Failed to delete image: " + fileName);
                }
        }
}