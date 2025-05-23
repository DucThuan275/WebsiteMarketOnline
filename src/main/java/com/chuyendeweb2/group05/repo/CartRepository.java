package com.chuyendeweb2.group05.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.Cart;
import com.chuyendeweb2.group05.entity.meta.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(Integer userId);

    boolean existsByUserId(Integer userId);

    List<Cart> findAll();
}