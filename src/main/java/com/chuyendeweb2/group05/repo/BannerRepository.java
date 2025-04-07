package com.chuyendeweb2.group05.repo;

import com.chuyendeweb2.group05.entity.meta.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveTrue();

    List<Banner> findAllByOrderByDisplayOrderAsc();
}