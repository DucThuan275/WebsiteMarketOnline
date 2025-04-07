package com.chuyendeweb2.group05.repo;

import com.chuyendeweb2.group05.entity.meta.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductId(Long productId);

    List<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);

    void deleteByProductId(Long productId);
}