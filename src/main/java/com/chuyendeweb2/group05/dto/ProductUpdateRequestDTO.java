package com.chuyendeweb2.group05.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequestDTO {

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name cannot exceed 255 characters")
    private String name;

    @NotBlank(message = "Product description is required")
    @Size(max = 1000, message = "Product description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Product price is required")
    @Positive(message = "Product price must be positive")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @Positive(message = "Stock quantity must be positive")
    private int stockQuantity;

    private String imageUrl;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}

// package com.pasanabeysekara.securitywithswagger.dto;

// import jakarta.validation.constraints.Min;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;

// import java.math.BigDecimal;

// @Getter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class ProductUpdateRequestDTO {

// @NotBlank(message = "Vui lòng nhập tên sản phẩm.")
// private String name;

// @NotBlank(message = "Vui lòng nhập mô tả sản phẩm.")
// private String description;

// @NotNull(message = "Vui lòng nhập giá sản phẩm.")
// @Min(value = 1, message = "Giá sản phẩm phải lớn hơn hoặc bằng 1 VNĐ.")
// private BigDecimal price;

// @NotNull(message = "Vui lòng nhập số lượng tồn kho.")
// @Min(value = 0, message = "Số lượng tồn kho không được nhỏ hơn 0.")
// private int stockQuantity;

// @NotBlank(message = "Vui lòng nhập URL hình ảnh sản phẩm.")
// private String imageUrl;

// @NotNull(message = "Vui lòng chọn danh mục sản phẩm.")
// private Long categoryId;
// }
