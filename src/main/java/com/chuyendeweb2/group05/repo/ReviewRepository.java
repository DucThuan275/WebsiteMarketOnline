package com.chuyendeweb2.group05.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.Review;
import com.chuyendeweb2.group05.entity.meta.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findAll(Pageable pageable);

    Long countByProduct(Product product);

    Long countByProductAndVerified(Product product, Boolean verified);

    Page<Review> findByProduct(Product product, Pageable pageable);

    List<Review> findByProduct(Product product);

    Page<Review> findByProductAndVerified(Product product, Boolean verified, Pageable pageable);

    Page<Review> findByProductAndRating(Product product, Integer rating, Pageable pageable);

    List<Review> findByUser(User user);

    Optional<Review> findByUserAndProduct(User user, Product product);
}