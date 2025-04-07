package com.chuyendeweb2.group05.entity.meta;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.chuyendeweb2.group05.dto.ProductUpdateRequestDTO;
import com.chuyendeweb2.group05.enums.ProductStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User seller;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int stockQuantity;

    // This will be used to store the primary image URL for backward compatibility
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.PENDING;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<OrderDetail> orderDetails = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Favorite> favorites = new ArrayList<>();

    // Calculate average rating
    @Transient
    public Double getAverageRating() {
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
    }

    // Calculate review count
    @Transient
    public Integer getReviewCount() {
        return reviews.size();
    }

    // Calculate favorite count
    @Transient
    public Integer getFavoriteCount() {
        return favorites.size();
    }

    // Get primary image URL (backward compatibility)
    @Transient
    public String getPrimaryImageUrl() {
        return images.stream()
                .filter(ProductImage::getIsPrimary)
                .findFirst()
                .map(ProductImage::getUrl)
                .orElse(imageUrl);
    }

    // Check if the product is active
    @Transient
    public boolean isActive() {
        return status == ProductStatus.ACTIVE;
    }

    public void update(ProductUpdateRequestDTO requestDTO, Category newCategory) {
        this.name = requestDTO.getName();
        this.description = requestDTO.getDescription();
        this.price = requestDTO.getPrice();
        this.stockQuantity = requestDTO.getStockQuantity();
        this.imageUrl = requestDTO.getImageUrl();
        this.category = newCategory;
        this.updatedAt = LocalDateTime.now();
        // After updating, set back to pending if it was active
        if (this.status == ProductStatus.ACTIVE) {
            this.status = ProductStatus.PENDING;
        }
    }

    // Method to activate product (only for admins)
    public void activate(User admin) {
        this.status = ProductStatus.ACTIVE;
        this.approvedBy = admin;
        this.approvedAt = LocalDateTime.now();
    }

    // Method to deactivate product
    public void deactivate() {
        this.status = ProductStatus.INACTIVE;
    }

    // Pre-persist lifecycle callback
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Pre-update lifecycle callback
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }

    public void setPrimaryImage(ProductImage newPrimaryImage) {
        // Remove primary flag from any existing primary image
        images.stream()
                .filter(ProductImage::getIsPrimary)
                .forEach(img -> img.setIsPrimary(false));

        // Set the new primary image
        if (newPrimaryImage != null && images.contains(newPrimaryImage)) {
            newPrimaryImage.setIsPrimary(true);
            // Update the legacy imageUrl field for backward compatibility
            this.imageUrl = newPrimaryImage.getUrl();
        }
    }

    public void addCartItem(CartItem cartItem) {
        cartItems.add(cartItem);
        cartItem.setProduct(this);
    }

    public void removeCartItem(CartItem cartItem) {
        cartItems.remove(cartItem);
        cartItem.setProduct(null);
    }

    public void addOrderDetail(OrderDetail orderDetail) {
        orderDetails.add(orderDetail);
        orderDetail.setProduct(this);
    }

    public void removeOrderDetail(OrderDetail orderDetail) {
        orderDetails.remove(orderDetail);
        orderDetail.setProduct(null);
    }

    public void addReview(Review review) {
        reviews.add(review);
        review.setProduct(this);
    }

    public void removeReview(Review review) {
        reviews.remove(review);
        review.setProduct(null);
    }

    public void addFavorite(Favorite favorite) {
        favorites.add(favorite);
        favorite.setProduct(this);
    }

    public void removeFavorite(Favorite favorite) {
        favorites.remove(favorite);
        favorite.setProduct(null);
    }

    // Method to reduce stock when an order is placed
    public void reduceStock(int quantity) {
        if (this.stockQuantity < quantity) {
            throw new IllegalStateException("Not enough stock for product: " + this.name);
        }
        this.stockQuantity -= quantity;
    }

    // Method to increase stock when an order is canceled
    public void increaseStock(int quantity) {
        this.stockQuantity += quantity;
    }
}