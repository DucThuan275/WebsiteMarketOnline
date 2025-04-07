package com.chuyendeweb2.group05.dto;

import com.chuyendeweb2.group05.entity.meta.Category;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponseDTO {
    private final Long id;
    private final String name;
    private final Long parentCategoryId;
    private final boolean isActive;

    public static CategoryResponseDTO fromEntity(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .isActive(category.getIsActive())
                .build();
    }
}
