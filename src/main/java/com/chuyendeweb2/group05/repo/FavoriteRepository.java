package com.chuyendeweb2.group05.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.Favorite;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.User;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Page<Favorite> findByUser(User user, Pageable pageable);

    Optional<Favorite> findByUserAndProduct(User user, Product product);

    boolean existsByUserAndProduct(User user, Product product);

    Long countByProduct(Product product);
}