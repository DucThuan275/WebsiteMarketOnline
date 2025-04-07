package com.chuyendeweb2.group05.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.WebsiteRevenueDTO;
import com.chuyendeweb2.group05.service.WebsiteRevenueService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/website-revenue")
@RequiredArgsConstructor
public class WebsiteRevenueController {

    private final WebsiteRevenueService websiteRevenueService;

    @GetMapping
    public ResponseEntity<List<WebsiteRevenueDTO>> getAllRevenue(Pageable pageable) {
        return ResponseEntity.ok(websiteRevenueService.getAllRevenue(pageable));
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(websiteRevenueService.getTotalRevenue());
    }
}
