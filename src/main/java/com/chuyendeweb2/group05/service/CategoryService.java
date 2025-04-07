package com.chuyendeweb2.group05.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.dto.CategoryCreateRequestDTO;
import com.chuyendeweb2.group05.dto.CategoryResponseDTO;
import com.chuyendeweb2.group05.dto.CategoryUpdateRequestDTO;
import com.chuyendeweb2.group05.entity.meta.Category;
import com.chuyendeweb2.group05.exception.CategoryAlreadyExistsException;
import com.chuyendeweb2.group05.exception.CategoryNotFoundException;
import com.chuyendeweb2.group05.repo.CategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public void deleteCategory(long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(CategoryNotFoundException::new);

        // Kiểm tra nếu danh mục này có sản phẩm con hoặc danh mục con, không thể xóa
        if (!category.getSubCategories().isEmpty()) {
            throw new RuntimeException("Danh mục này có danh mục con, không thể xóa.");
        }

        // Kiểm tra nếu danh mục này có sản phẩm liên kết (giả sử có mối quan hệ với sản
        // phẩm)
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new RuntimeException("Danh mục này có sản phẩm liên kết, không thể xóa.");
        }

        // Xóa danh mục
        categoryRepository.delete(category);
    }

    public List<CategoryResponseDTO> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(CategoryResponseDTO::fromEntity) // Sử dụng fromEntity
                .toList();
    }

    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(CategoryResponseDTO::fromEntity) // Sử dụng fromEntity
                .toList();
    }

    public List<CategoryResponseDTO> getSubCategories(long id) {
        Category parent = categoryRepository.findById(id)
                .orElseThrow(CategoryNotFoundException::new);
        return categoryRepository.findByParentCategory(parent).stream()
                .map(CategoryResponseDTO::fromEntity) // Sử dụng fromEntity
                .toList();
    }

    @Transactional
    public CategoryResponseDTO createCategory(CategoryCreateRequestDTO requestDTO) {
        if (categoryRepository.existsByName(requestDTO.getName())) {
            throw new CategoryAlreadyExistsException();
        }
        Category parent = null;
        if (requestDTO.getParentCategoryId() != null) {
            parent = categoryRepository.findById(requestDTO.getParentCategoryId())
                    .orElseThrow(CategoryNotFoundException::new);
        }

        Category category = Category.builder()
                .name(requestDTO.getName())
                .parentCategory(parent)
                .isActive(true)
                .build();

        Category saved = categoryRepository.save(category);
        return CategoryResponseDTO.fromEntity(saved); // Sử dụng fromEntity
    }

    @Transactional
    public CategoryResponseDTO updateCategory(long id, CategoryUpdateRequestDTO requestDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(CategoryNotFoundException::new);

        if (requestDTO.getName() != null && !requestDTO.getName().equals(category.getName())) {
            if (categoryRepository.existsByNameAndIdNot(requestDTO.getName(), id)) {
                throw new CategoryAlreadyExistsException();
            }
            category.updateName(requestDTO.getName());
        }

        if (requestDTO.getParentCategoryId() != null) {
            Long currentParentId = category.getParentCategory() != null ? category.getParentCategory().getId() : null;
            if (!requestDTO.getParentCategoryId().equals(currentParentId)) {
                Category parent = categoryRepository.findById(requestDTO.getParentCategoryId())
                        .orElseThrow(CategoryNotFoundException::new);
                category.updateParentCategory(parent);
            }
        }

        return CategoryResponseDTO.fromEntity(category);
    }

    @Transactional
    public void activateCategory(long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(CategoryNotFoundException::new);
        category.activate();
    }

    @Transactional
    public void deactivateCategory(long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(CategoryNotFoundException::new);
        category.deactivate();
    }
}
