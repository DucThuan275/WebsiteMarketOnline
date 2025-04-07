package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.FavoriteDTO;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.service.FavoriteService;

@RestController
@RequestMapping("/api/v1/favorites")
@Tag(name = "Favorites", description = "API quản lý danh sách yêu thích")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Thêm một sản phẩm vào danh sách yêu thích của người dùng.
     *
     * @param user      Người dùng hiện tại (được xác thực thông qua token)
     * @param productId ID của sản phẩm cần thêm vào danh sách yêu thích
     * @return FavoriteDTO chứa thông tin về sản phẩm yêu thích đã thêm
     */
    @PostMapping("/add/{productId}")
    public ResponseEntity<FavoriteDTO> addFavorite(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        return ResponseEntity.ok(favoriteService.addFavorite(user, productId));
    }

    /**
     * Xóa một sản phẩm khỏi danh sách yêu thích của người dùng.
     *
     * @param user      Người dùng hiện tại (được xác thực thông qua token)
     * @param productId ID của sản phẩm cần xóa khỏi danh sách yêu thích
     * @return ResponseEntity với mã trạng thái 204 (No Content) nếu thành công
     */
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeFavorite(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        favoriteService.removeFavorite(user, productId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách sản phẩm yêu thích của người dùng hiện tại, có hỗ trợ phân
     * trang.
     *
     * @param user     Người dùng hiện tại (được xác thực thông qua token)
     * @param pageable Đối tượng phân trang, chứa thông tin về số trang và số mục
     *                 trên mỗi trang
     * @return Page<FavoriteDTO> chứa danh sách sản phẩm yêu thích của người dùng
     */
    @GetMapping("/list")
    public ResponseEntity<Page<FavoriteDTO>> getUserFavorites(@AuthenticationPrincipal User user, Pageable pageable) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(user, pageable));
    }

    /**
     * Kiểm tra xem một sản phẩm có nằm trong danh sách yêu thích của người dùng hay
     * không.
     *
     * @param user      Người dùng hiện tại (được xác thực thông qua token)
     * @param productId ID của sản phẩm cần kiểm tra
     * @return Boolean (true nếu sản phẩm có trong danh sách yêu thích, false nếu
     *         không)
     */
    @GetMapping("/exists/{productId}")
    public ResponseEntity<Boolean> isProductFavorited(@AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(favoriteService.isProductFavorited(user, productId));
    }

    /**
     * Lấy số lượng người dùng đã thêm một sản phẩm vào danh sách yêu thích.
     *
     * @param productId ID của sản phẩm cần lấy số lượt yêu thích
     * @return Long số lượng người dùng đã yêu thích sản phẩm này
     */
    @GetMapping("/count/{productId}")
    public ResponseEntity<Long> getFavoriteCount(@PathVariable Long productId) {
        return ResponseEntity.ok(favoriteService.getFavoriteCount(productId));
    }
}

// package com.pasanabeysekara.securitywithswagger.controller;

// import com.pasanabeysekara.securitywithswagger.dto.FavoriteDTO;
// import com.pasanabeysekara.securitywithswagger.entity.meta.User;
// import com.pasanabeysekara.securitywithswagger.service.FavoriteService;

// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/v1/favorites")
// @Tag(name = "Favorites", description = "API quản lý danh sách yêu thích")
// @SecurityRequirement(name = "bearerAuth")
// @RequiredArgsConstructor
// public class FavoriteController {
// private final FavoriteService favoriteService;

// @PostMapping("/add/{productId}")
// public ResponseEntity<FavoriteDTO> addFavorite(@AuthenticationPrincipal User
// user, @PathVariable Long productId) {
// return ResponseEntity.ok(favoriteService.addFavorite(user, productId));
// }

// @DeleteMapping("/remove/{productId}")
// public ResponseEntity<Void> removeFavorite(@AuthenticationPrincipal User
// user, @PathVariable Long productId) {
// favoriteService.removeFavorite(user, productId);
// return ResponseEntity.noContent().build();
// }

// @GetMapping("/list")
// public ResponseEntity<Page<FavoriteDTO>>
// getUserFavorites(@AuthenticationPrincipal User user, Pageable pageable) {
// return ResponseEntity.ok(favoriteService.getUserFavorites(user, pageable));
// }

// @GetMapping("/exists/{productId}")
// public ResponseEntity<Boolean> isProductFavorited(@AuthenticationPrincipal
// User user,
// @PathVariable Long productId) {
// return ResponseEntity.ok(favoriteService.isProductFavorited(user,
// productId));
// }

// @GetMapping("/count/{productId}")
// public ResponseEntity<Long> getFavoriteCount(@PathVariable Long productId) {
// return ResponseEntity.ok(favoriteService.getFavoriteCount(productId));
// }
// }