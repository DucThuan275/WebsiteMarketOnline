package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.chuyendeweb2.group05.dto.WebsiteRevenueDTO;
import com.chuyendeweb2.group05.entity.meta.WebsiteRevenue;
import com.chuyendeweb2.group05.repo.WebsiteRevenueRepository;
import com.chuyendeweb2.group05.service.WebsiteRevenueService;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WebsiteRevenueServiceImpl implements WebsiteRevenueService {

    private final WebsiteRevenueRepository websiteRevenueRepository;

    @Override
    public List<WebsiteRevenueDTO> getAllRevenue(Pageable pageable) {
        Page<WebsiteRevenue> revenuePage = websiteRevenueRepository.findAll(pageable);
        return revenuePage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal getTotalRevenue() {
        List<WebsiteRevenue> revenues = websiteRevenueRepository.findAll();
        return revenues.stream()
                .map(WebsiteRevenue::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private WebsiteRevenueDTO mapToDTO(WebsiteRevenue revenue) {
        return WebsiteRevenueDTO.builder()
                .id(revenue.getId())
                .orderId(revenue.getOrder() != null ? revenue.getOrder().getId() : null)
                .productId(revenue.getProduct() != null ? revenue.getProduct().getId() : null)
                .sellerId(revenue.getSeller() != null ? revenue.getSeller().getId().longValue() : null) // Ép kiểu ở đây
                .sellerEmail(revenue.getSeller() != null ? revenue.getSeller().getEmail() : null)
                .amount(revenue.getAmount())
                .description(revenue.getDescription())
                .createdAt(revenue.getCreatedAt())
                .build();
    }

}