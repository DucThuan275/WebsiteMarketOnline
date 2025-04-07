package com.chuyendeweb2.group05.dto;

import com.chuyendeweb2.group05.enums.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}