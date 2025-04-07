package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.CartItemRequestDTO;
import com.chuyendeweb2.group05.dto.CartResponseDTO;
import com.chuyendeweb2.group05.response.ErrorResponseDTO;
import com.chuyendeweb2.group05.service.CartService;
import com.chuyendeweb2.group05.service.UserService;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart Controller", description = "Endpoints for managing shopping cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping("get-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all carts", description = "Admin endpoint to get all carts of all users")
    public ResponseEntity<List<CartResponseDTO>> getAllCarts() {
        List<CartResponseDTO> carts = cartService.getAllCarts();
        return ResponseEntity.ok(carts);
    }

    /**
     * Lấy giỏ hàng của người dùng hiện tại
     * 
     * @param userDetails Thông tin người dùng đã đăng nhập
     * @return CartResponseDTO chứa thông tin giỏ hàng
     */
    @GetMapping
    @Operation(summary = "Get current user's cart", description = "Retrieves the cart for the authenticated user")
    public ResponseEntity<CartResponseDTO> getCurrentUserCart(@AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
        CartResponseDTO cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * 
     * @param userDetails Thông tin người dùng đã đăng nhập
     * @param request     Dữ liệu sản phẩm cần thêm vào giỏ hàng
     * @return CartResponseDTO chứa giỏ hàng sau khi thêm sản phẩm
     */
    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Adds a product to the authenticated user's cart")
    public ResponseEntity<CartResponseDTO> addItemToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemRequestDTO request) {
        Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
        CartResponseDTO cart = cartService.addItemToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * 
     * @param userDetails Thông tin người dùng đã đăng nhập
     * @param itemId      ID của sản phẩm trong giỏ hàng
     * @param request     Dữ liệu cập nhật số lượng sản phẩm
     * @return CartResponseDTO chứa giỏ hàng sau khi cập nhật
     */
    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item", description = "Updates the quantity of an item in the cart")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            @RequestBody CartItemRequestDTO request) {
        Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
        CartResponseDTO cart = cartService.updateCartItem(userId, itemId, request);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping(value = "/items/{itemId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Remove item from cart", description = "Removes an item from the user's cart")
    public ResponseEntity<?> removeItemFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId) {
        try {
            Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
            CartResponseDTO cart = cartService.removeItemFromCart(userId, itemId);
            return ResponseEntity.ok(cart);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO("Item Not Found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO("Invalid Request", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Internal Server Error", e.getMessage()));
        }
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * 
     * @param userDetails Thông tin người dùng đã đăng nhập
     */
    @DeleteMapping
    @Operation(summary = "Clear cart", description = "Removes all items from the user's cart")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Quản trị viên lấy giỏ hàng của một người dùng bất kỳ
     * 
     * @param userId ID của người dùng
     * @return CartResponseDTO chứa giỏ hàng của người dùng
     */
    @GetMapping("/admin/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get cart by user ID", description = "Admin endpoint to get cart of any user")
    public ResponseEntity<CartResponseDTO> getCartByUserId(@PathVariable Integer userId) {
        CartResponseDTO cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }
}
// package com.pasanabeysekara.securitywithswagger.controller;

// import com.pasanabeysekara.securitywithswagger.dto.CartItemRequestDTO;
// import com.pasanabeysekara.securitywithswagger.dto.CartResponseDTO;
// import com.pasanabeysekara.securitywithswagger.service.CartService;
// import com.pasanabeysekara.securitywithswagger.service.UserService;
// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/v1/cart")
// @RequiredArgsConstructor
// @Tag(name = "Cart Controller", description = "Endpoints for managing shopping
// cart")
// public class CartController {

// private final CartService cartService;
// private final UserService userService;

// @GetMapping
// @Operation(summary = "Get current user's cart", description = "Retrieves the
// cart for the authenticated user")
// public ResponseEntity<CartResponseDTO>
// getCurrentUserCart(@AuthenticationPrincipal UserDetails userDetails) {
// Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
// CartResponseDTO cart = cartService.getCartByUserId(userId);
// return ResponseEntity.ok(cart);
// }

// @PostMapping("/items")
// @Operation(summary = "Add item to cart", description = "Adds a product to the
// authenticated user's cart")
// public ResponseEntity<CartResponseDTO> addItemToCart(
// @AuthenticationPrincipal UserDetails userDetails,
// @RequestBody CartItemRequestDTO request) {
// Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
// CartResponseDTO cart = cartService.addItemToCart(userId, request);
// return ResponseEntity.status(HttpStatus.CREATED).body(cart);
// }

// @PutMapping("/items/{itemId}")
// @Operation(summary = "Update cart item", description = "Updates the quantity
// of an item in the cart")
// public ResponseEntity<CartResponseDTO> updateCartItem(
// @AuthenticationPrincipal UserDetails userDetails,
// @PathVariable Long itemId,
// @RequestBody CartItemRequestDTO request) {
// Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
// CartResponseDTO cart = cartService.updateCartItem(userId, itemId, request);
// return ResponseEntity.ok(cart);
// }

// @DeleteMapping("/items/{itemId}")
// @Operation(summary = "Remove item from cart", description = "Removes an item
// from the user's cart")
// public ResponseEntity<CartResponseDTO> removeItemFromCart(
// @AuthenticationPrincipal UserDetails userDetails,
// @PathVariable Long itemId) {
// Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
// CartResponseDTO cart = cartService.removeItemFromCart(userId, itemId);
// return ResponseEntity.ok(cart);
// }

// @DeleteMapping
// @Operation(summary = "Clear cart", description = "Removes all items from the
// user's cart")
// public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails
// userDetails) {
// Integer userId = userService.getUserIdByEmail(userDetails.getUsername());
// cartService.clearCart(userId);
// return ResponseEntity.noContent().build();
// }

// // Admin endpoints
// @GetMapping("/admin/users/{userId}")
// @PreAuthorize("hasRole('ADMIN')")
// @Operation(summary = "Get cart by user ID", description = "Admin endpoint to
// get cart of any user")
// public ResponseEntity<CartResponseDTO> getCartByUserId(@PathVariable Integer
// userId) {
// CartResponseDTO cart = cartService.getCartByUserId(userId);
// return ResponseEntity.ok(cart);
// }
// }