package com.chuyendeweb2.group05.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.chuyendeweb2.group05.enums.OrderStatus;
import com.chuyendeweb2.group05.enums.PaymentMethod;
import com.chuyendeweb2.group05.enums.PaymentStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private Integer userId;
    private String userEmail;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String contactPhone;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderDetailDTO> orderDetails;
}