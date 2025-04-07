package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.CategoryCreateRequestDTO;
import com.chuyendeweb2.group05.dto.CategoryResponseDTO;
import com.chuyendeweb2.group05.dto.CategoryUpdateRequestDTO;
import com.chuyendeweb2.group05.response.ApiResponse;
import com.chuyendeweb2.group05.service.CategoryService;

import java.util.List;

/**
 * Controller để quản lý danh mục.
 * Cung cấp các API để lấy, tạo, cập nhật, kích hoạt và vô hiệu hóa danh mục.
 */
@Tag(name = "Danh mục", description = "Cung cấp các chức năng quản lý danh mục.")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    // Service xử lý logic liên quan đến danh mục
    private final CategoryService categoryService;

    /**
     * API lấy danh sách danh mục đang hoạt động.
     * Trả về danh sách các danh mục có trạng thái hoạt động.
     */
    @Operation(summary = "Lấy danh sách danh mục đang hoạt động", description = "Người dùng và quản trị viên có thể lấy danh sách danh mục đang hoạt động.")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getActiveCategories()));
    }

    /**
     * API lấy toàn bộ danh mục.
     * Chỉ dành cho quản trị viên.
     */
    @Operation(summary = "Lấy toàn bộ danh mục (Dành cho quản trị viên)", description = "Quản trị viên có thể lấy toàn bộ danh mục.")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    /**
     * API lấy danh mục con của một danh mục cụ thể.
     * Chỉ dành cho quản trị viên.
     */
    @Operation(summary = "Lấy danh mục con (Dành cho quản trị viên)", description = "Quản trị viên có thể lấy danh mục con của một danh mục cụ thể.")
    @GetMapping("/{id}/sub-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getSubCategories(@PathVariable long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getSubCategories(id)));
    }

    /**
     * API tạo danh mục mới.
     * Chỉ dành cho quản trị viên.
     */
    @Operation(summary = "Tạo danh mục (Dành cho quản trị viên)", description = "Quản trị viên có thể tạo danh mục mới.")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> createCategory(
            @RequestBody @Valid CategoryCreateRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categoryService.createCategory(requestDTO)));
    }

    /**
     * API chỉnh sửa danh mục cụ thể.
     * Chỉ dành cho quản trị viên.
     */
    @Operation(summary = "Chỉnh sửa danh mục (Dành cho quản trị viên)", description = "Quản trị viên có thể chỉnh sửa danh mục cụ thể.")
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> updateCategory(@PathVariable long id,
            @RequestBody @Valid CategoryUpdateRequestDTO requestDTO) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCategory(id, requestDTO)));
    }

    /**
     * API kích hoạt danh mục cụ thể.
     * Chỉ dành cho quản trị viên.
     */
    @Operation(summary = "Kích hoạt danh mục (Dành cho quản trị viên)", description = "Quản trị viên có thể kích hoạt danh mục cụ thể.")
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateCategory(@PathVariable long id) {
        categoryService.activateCategory(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API vô hiệu hóa danh mục cụ thể.
     * Chỉ dành cho quản trị viên.
     */
    @Operation(summary = "Vô hiệu hóa danh mục (Dành cho quản trị viên)", description = "Quản trị viên có thể vô hiệu hóa danh mục cụ thể.")
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateCategory(@PathVariable long id) {
        categoryService.deactivateCategory(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Xóa danh mục (Dành cho quản trị viên)", description = "Quản trị viên có thể xóa danh mục.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        }
    }

}
