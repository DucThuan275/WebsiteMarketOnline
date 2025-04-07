package com.chuyendeweb2.group05.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.ProductStatus;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
        List<Product> findByStatus(ProductStatus status);

        Page<Product> findByStatus(ProductStatus status, Pageable pageable);

        List<Product> findBySeller(User seller);

        Page<Product> findBySeller(User seller, Pageable pageable);
}