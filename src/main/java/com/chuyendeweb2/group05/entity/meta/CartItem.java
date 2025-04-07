package com.chuyendeweb2.group05.entity.meta;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId; // Thêm trường sellerId vào

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    private boolean deleted; // Flag to track if the item has been deleted

    // Getters and setters for deleted flag
    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public void incrementQuantity() {
        this.quantity++;
    }

    public void decrementQuantity() {
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    public void updateQuantity(int quantity) {
        this.quantity = quantity;
    }
}

// @Entity
// @Table(name = "cart_items")
// @EntityListeners(AuditingEntityListener.class)
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class CartItem {

// @Id
// @GeneratedValue(strategy = GenerationType.IDENTITY)
// private Long id;

// @ManyToOne(fetch = FetchType.LAZY)
// @JoinColumn(name = "cart_id", nullable = false)
// private Cart cart;

// @ManyToOne(fetch = FetchType.LAZY)
// @JoinColumn(name = "product_id", nullable = false)
// private Product product;

// @Column(nullable = false)
// private int quantity;

// @CreatedDate
// @Column(nullable = false, updatable = false)
// private LocalDateTime createdAt;

// @LastModifiedDate
// @Column(nullable = false)
// private LocalDateTime updatedAt;

// public void incrementQuantity() {
// this.quantity++;
// }

// public void decrementQuantity() {
// if (this.quantity > 1) {
// this.quantity--;
// }
// }

// public void updateQuantity(int quantity) {
// this.quantity = quantity;
// }
// }