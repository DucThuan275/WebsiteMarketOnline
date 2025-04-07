package com.chuyendeweb2.group05.service;

import org.springframework.data.domain.Pageable;

import com.chuyendeweb2.group05.dto.WebsiteRevenueDTO;

import java.math.BigDecimal;
import java.util.List;

public interface WebsiteRevenueService {
    List<WebsiteRevenueDTO> getAllRevenue(Pageable pageable);

    BigDecimal getTotalRevenue();
}