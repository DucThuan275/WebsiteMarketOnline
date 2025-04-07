package com.chuyendeweb2.group05.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.Cart;
import com.chuyendeweb2.group05.entity.meta.CartItem;
import com.chuyendeweb2.group05.entity.meta.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    void deleteByCartId(Long cartId);

    boolean existsByCartIdAndProductId(Long cartId, Long productId);
}