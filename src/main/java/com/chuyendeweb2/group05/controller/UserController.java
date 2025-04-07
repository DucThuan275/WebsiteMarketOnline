package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.UserProfileDTO;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for user management operations") // Gán mô tả cho nhóm API User
                                                                                    // Management
public class UserController {

        private final UserService userService; // Inject UserService để xử lý logic liên quan đến User

        /**
         * Lấy thông tin hồ sơ của người dùng hiện tại (đã xác thực).
         * 
         * @return UserProfileDTO chứa thông tin người dùng.
         */
        @Operation(summary = "Get current user profile", description = "Retrieves the profile of the currently authenticated user", security = {
                        @SecurityRequirement(name = "bearerAuth") })
        @GetMapping("/profile")
        public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String email = authentication.getName(); // Lấy email của user hiện tại
                User user = userService.getCurrentUser(email); // Truy xuất thông tin user từ service
                UserProfileDTO profileDTO = mapToProfileDTO(user); // Chuyển đổi entity sang DTO
                return ResponseEntity.ok(profileDTO);
        }

        /**
         * Lấy thông tin của một người dùng cụ thể theo ID (chỉ dành cho ADMIN).
         *
         * @param id ID của người dùng cần truy vấn.
         * @return Thông tin chi tiết của người dùng.
         */
        @Operation(summary = "Get user by ID", description = "Retrieves a user by their ID. Requires ADMIN role.", security = {
                        @SecurityRequirement(name = "bearerAuth") })
        @GetMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới có quyền truy cập API này
        public ResponseEntity<UserProfileDTO> getUserById(
                        @Parameter(description = "User ID", required = true) @PathVariable Integer id) {
                User user = userService.getUserById(id); // Lấy thông tin user theo ID
                UserProfileDTO profileDTO = mapToProfileDTO(user);
                return ResponseEntity.ok(profileDTO);
        }

        /**
         * Kiểm tra xem email đã tồn tại trong hệ thống hay chưa.
         *
         * @param email Email cần kiểm tra.
         * @return true nếu email đã tồn tại, false nếu chưa.
         */
        @Operation(summary = "Check if email exists", description = "Checks if a user with the given email already exists")
        @GetMapping("/check-email")
        public ResponseEntity<Boolean> checkEmailExists(
                        @Parameter(description = "Email to check", required = true) @RequestParam String email) {
                boolean exists = userService.existsByEmail(email);
                return ResponseEntity.ok(exists);
        }

        /**
         * Cập nhật hồ sơ của người dùng hiện tại.
         *
         * @param userProfileDTO Dữ liệu cập nhật hồ sơ.
         * @return Thông tin hồ sơ sau khi cập nhật.
         */
        @Operation(summary = "Update user profile", description = "Updates the profile of the currently authenticated user", security = {
                        @SecurityRequirement(name = "bearerAuth") })
        @PutMapping("/profile")
        public ResponseEntity<UserProfileDTO> updateUserProfile(@Valid @RequestBody UserProfileDTO userProfileDTO) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String email = authentication.getName();
                User user = userService.getCurrentUser(email);

                // Cập nhật thông tin người dùng
                user.setFirstname(userProfileDTO.getFirstname());
                user.setLastname(userProfileDTO.getLastname());
                user.setAddress(userProfileDTO.getAddress());
                user.setMobileNumber(userProfileDTO.getMobileNumber());

                // Lưu thông tin đã cập nhật
                User updatedUser = userService.updateUser(user);
                UserProfileDTO updatedProfileDTO = mapToProfileDTO(updatedUser);
                return ResponseEntity.ok(updatedProfileDTO);
        }

        /**
         * Lấy danh sách tất cả người dùng (chỉ dành cho ADMIN).
         *
         * @return Danh sách tất cả người dùng trong hệ thống.
         */
        @Operation(summary = "Get all users", description = "Retrieves all users. Requires ADMIN role.", security = {
                        @SecurityRequirement(name = "bearerAuth") })
        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
                List<User> users = userService.getAllUsers();
                List<UserProfileDTO> userDTOs = users.stream()
                                .map(this::mapToProfileDTO)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(userDTOs);
        }

        /**
         * Xóa một người dùng theo ID (chỉ dành cho ADMIN).
         *
         * @param id ID của người dùng cần xóa.
         * @return ResponseEntity với trạng thái 204 No Content nếu xóa thành công.
         */
        @Operation(summary = "Delete user", description = "Deletes a user by their ID. Requires ADMIN role.", security = {
                        @SecurityRequirement(name = "bearerAuth") })
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> deleteUser(
                        @Parameter(description = "User ID", required = true) @PathVariable Integer id) {
                userService.deleteUser(id);
                return ResponseEntity.noContent().build();
        }

        /**
         * Chuyển đổi entity `User` thành DTO `UserProfileDTO` để trả về client.
         *
         * @param user Đối tượng User cần chuyển đổi.
         * @return UserProfileDTO chứa thông tin cần thiết.
         */
        private UserProfileDTO mapToProfileDTO(User user) {
                return UserProfileDTO.builder()
                                .id(user.getId())
                                .firstname(user.getFirstname())
                                .lastname(user.getLastname())
                                .email(user.getEmail())
                                .address(user.getAddress())
                                .mobileNumber(user.getMobileNumber())
                                .gender(user.getGender())
                                .role(user.getRole())
                                .build();
        }
}

// package com.pasanabeysekara.securitywithswagger.controller;

// import com.pasanabeysekara.securitywithswagger.dto.UserProfileDTO;
// import com.pasanabeysekara.securitywithswagger.entity.meta.User;
// import com.pasanabeysekara.securitywithswagger.service.UserService;
// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.Parameter;
// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;
// import java.util.stream.Collectors;

// @RestController
// @RequestMapping("/api/v1/users")
// @RequiredArgsConstructor
// @Tag(name = "User Management", description = "APIs for user management
// operations")
// public class UserController {

// private final UserService userService;

// @Operation(summary = "Get current user profile", description = "Retrieves the
// profile of the currently authenticated user", security = {
// @SecurityRequirement(name = "bearerAuth") })
// @GetMapping("/profile")
// public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
// Authentication authentication =
// SecurityContextHolder.getContext().getAuthentication();
// String email = authentication.getName();
// User user = userService.getCurrentUser(email);
// UserProfileDTO profileDTO = mapToProfileDTO(user);
// return ResponseEntity.ok(profileDTO);
// }

// @Operation(summary = "Get user by ID", description = "Retrieves a user by
// their ID. Requires ADMIN role.", security = {
// @SecurityRequirement(name = "bearerAuth") })
// @GetMapping("/{id}")
// @PreAuthorize("hasRole('ADMIN')")
// public ResponseEntity<UserProfileDTO> getUserById(
// @Parameter(description = "User ID", required = true) @PathVariable Integer
// id) {
// User user = userService.getUserById(id);
// UserProfileDTO profileDTO = mapToProfileDTO(user);
// return ResponseEntity.ok(profileDTO);
// }

// @Operation(summary = "Check if email exists", description = "Checks if a user
// with the given email already exists")
// @GetMapping("/check-email")
// public ResponseEntity<Boolean> checkEmailExists(
// @Parameter(description = "Email to check", required = true) @RequestParam
// String email) {
// boolean exists = userService.existsByEmail(email);
// return ResponseEntity.ok(exists);
// }

// @Operation(summary = "Update user profile", description = "Updates the
// profile of the currently authenticated user", security = {
// @SecurityRequirement(name = "bearerAuth") })
// @PutMapping("/profile")
// public ResponseEntity<UserProfileDTO> updateUserProfile(
// @Valid @RequestBody UserProfileDTO userProfileDTO) {
// Authentication authentication =
// SecurityContextHolder.getContext().getAuthentication();
// String email = authentication.getName();
// User user = userService.getCurrentUser(email);

// // Update user fields
// user.setFirstname(userProfileDTO.getFirstname());
// user.setLastname(userProfileDTO.getLastname());
// user.setAddress(userProfileDTO.getAddress());
// user.setMobileNumber(userProfileDTO.getMobileNumber());

// // Save updated user
// User updatedUser = userService.updateUser(user);
// UserProfileDTO updatedProfileDTO = mapToProfileDTO(updatedUser);
// return ResponseEntity.ok(updatedProfileDTO);
// }

// @Operation(summary = "Get all users", description = "Retrieves all users.
// Requires ADMIN role.", security = {
// @SecurityRequirement(name = "bearerAuth") })
// @GetMapping
// @PreAuthorize("hasRole('ADMIN')")
// public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
// List<User> users = userService.getAllUsers();
// List<UserProfileDTO> userDTOs = users.stream()
// .map(this::mapToProfileDTO)
// .collect(Collectors.toList());
// return ResponseEntity.ok(userDTOs);
// }

// @Operation(summary = "Delete user", description = "Deletes a user by their
// ID. Requires ADMIN role.", security = {
// @SecurityRequirement(name = "bearerAuth") })
// @DeleteMapping("/{id}")
// @PreAuthorize("hasRole('ADMIN')")
// public ResponseEntity<Void> deleteUser(
// @Parameter(description = "User ID", required = true) @PathVariable Integer
// id) {
// userService.deleteUser(id);
// return ResponseEntity.noContent().build();
// }

// private UserProfileDTO mapToProfileDTO(User user) {
// return UserProfileDTO.builder()
// .id(user.getId())
// .firstname(user.getFirstname())
// .lastname(user.getLastname())
// .email(user.getEmail())
// .address(user.getAddress())
// .mobileNumber(user.getMobileNumber())
// .gender(user.getGender())
// .role(user.getRole())
// .build();
// }
// }