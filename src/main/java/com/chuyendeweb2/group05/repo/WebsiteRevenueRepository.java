package com.chuyendeweb2.group05.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.WebsiteRevenue;

@Repository
public interface WebsiteRevenueRepository extends JpaRepository<WebsiteRevenue, Long> {
}