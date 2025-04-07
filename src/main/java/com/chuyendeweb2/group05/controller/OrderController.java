package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.OrderDTO;
import com.chuyendeweb2.group05.dto.OrderRequest;
import com.chuyendeweb2.group05.dto.OrderStatusUpdateRequest;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.OrderStatus;
import com.chuyendeweb2.group05.enums.Role;
import com.chuyendeweb2.group05.service.OrderService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order API", description = "Endpoints for managing orders")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    // Get all orders (admin access)
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Tạo đơn hàng mới từ giỏ hàng của người dùng.
     */
    @PostMapping
    @Operation(summary = "Create a new order from the user's cart")
    public ResponseEntity<OrderDTO> createOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderRequest orderRequest) {
        OrderDTO orderDTO = orderService.createOrderFromCart(user, orderRequest);
        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }

    /**
     * Lấy thông tin chi tiết của đơn hàng theo ID.
     */
    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        OrderDTO orderDTO = orderService.getOrderById(orderId);

        // Kiểm tra quyền truy cập
        if (!user.getRole().equals(Role.ADMIN) && !orderDTO.getUserId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(orderDTO);
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại.
     */
    @GetMapping("/my-orders")
    @Operation(summary = "Get all orders for the current user")
    public ResponseEntity<List<OrderDTO>> getCurrentUserOrders(
            @AuthenticationPrincipal User user) {
        List<OrderDTO> orders = orderService.getUserOrders(user);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy danh sách đơn hàng theo trạng thái (chỉ Admin mới có quyền truy cập).
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get orders by status (Admin only)")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(
            @PathVariable OrderStatus status) {
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy danh sách đơn hàng theo khoảng ngày (chỉ Admin mới có quyền truy cập).
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get orders between date range (Admin only)")
    public ResponseEntity<List<OrderDTO>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<OrderDTO> orders = orderService.getOrdersBetweenDates(startDate, endDate);
        return ResponseEntity.ok(orders);
    }

    /**
     * Cập nhật trạng thái đơn hàng (chỉ Admin mới có quyền truy cập).
     */
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status (Admin only)")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest statusUpdateRequest) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, statusUpdateRequest);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Hủy đơn hàng (Người dùng hoặc Admin đều có thể thực hiện).
     */
    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        // Kiểm tra quyền hủy đơn hàng
        OrderDTO orderDTO = orderService.getOrderById(orderId);
        if (!user.getRole().equals(Role.ADMIN) && !orderDTO.getUserId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xóa đơn hàng (chỉ Admin mới có quyền truy cập).
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an order (Admin only)")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}

// package com.pasanabeysekara.securitywithswagger.controller;

// import com.pasanabeysekara.securitywithswagger.dto.OrderDTO;
// import com.pasanabeysekara.securitywithswagger.dto.OrderRequest;
// import com.pasanabeysekara.securitywithswagger.dto.OrderStatusUpdateRequest;
// import com.pasanabeysekara.securitywithswagger.entity.meta.User;
// import com.pasanabeysekara.securitywithswagger.enums.OrderStatus;
// import com.pasanabeysekara.securitywithswagger.enums.Role;
// import com.pasanabeysekara.securitywithswagger.service.OrderService;
// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.format.annotation.DateTimeFormat;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.web.bind.annotation.*;

// import java.time.LocalDateTime;
// import java.util.List;

// @RestController
// @RequestMapping("/api/v1/orders")
// @RequiredArgsConstructor
// @Tag(name = "Order API", description = "Endpoints for managing orders")
// @SecurityRequirement(name = "bearerAuth")
// public class OrderController {

// private final OrderService orderService;

// @PostMapping
// @Operation(summary = "Create a new order from the user's cart")
// public ResponseEntity<OrderDTO> createOrder(
// @AuthenticationPrincipal User user,
// @Valid @RequestBody OrderRequest orderRequest) {
// OrderDTO orderDTO = orderService.createOrderFromCart(user, orderRequest);
// return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
// }

// @GetMapping("/{orderId}")
// @Operation(summary = "Get order details by ID")
// public ResponseEntity<OrderDTO> getOrderById(
// @PathVariable Long orderId,
// @AuthenticationPrincipal User user) {
// OrderDTO orderDTO = orderService.getOrderById(orderId);

// // Check if the user is authorized to access this order
// if (!user.getRole().equals(Role.ADMIN) &&
// !orderDTO.getUserId().equals(user.getId())) {
// return new ResponseEntity<>(HttpStatus.FORBIDDEN);
// }

// return ResponseEntity.ok(orderDTO);
// }

// @GetMapping("/my-orders")
// @Operation(summary = "Get all orders for the current user")
// public ResponseEntity<List<OrderDTO>> getCurrentUserOrders(
// @AuthenticationPrincipal User user) {
// List<OrderDTO> orders = orderService.getUserOrders(user);
// return ResponseEntity.ok(orders);
// }

// @GetMapping("/status/{status}")
// @PreAuthorize("hasRole('ADMIN')")
// @Operation(summary = "Get orders by status (Admin only)")
// public ResponseEntity<List<OrderDTO>> getOrdersByStatus(
// @PathVariable OrderStatus status) {
// List<OrderDTO> orders = orderService.getOrdersByStatus(status);
// return ResponseEntity.ok(orders);
// }

// @GetMapping("/date-range")
// @PreAuthorize("hasRole('ADMIN')")
// @Operation(summary = "Get orders between date range (Admin only)")
// public ResponseEntity<List<OrderDTO>> getOrdersByDateRange(
// @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
// LocalDateTime startDate,
// @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
// LocalDateTime endDate) {
// List<OrderDTO> orders = orderService.getOrdersBetweenDates(startDate,
// endDate);
// return ResponseEntity.ok(orders);
// }

// @PatchMapping("/{orderId}/status")
// @PreAuthorize("hasRole('ADMIN')")
// @Operation(summary = "Update order status (Admin only)")
// public ResponseEntity<OrderDTO> updateOrderStatus(
// @PathVariable Long orderId,
// @Valid @RequestBody OrderStatusUpdateRequest statusUpdateRequest) {
// OrderDTO updatedOrder = orderService.updateOrderStatus(orderId,
// statusUpdateRequest);
// return ResponseEntity.ok(updatedOrder);
// }

// @PostMapping("/{orderId}/cancel")
// @Operation(summary = "Cancel an order")
// public ResponseEntity<Void> cancelOrder(
// @PathVariable Long orderId,
// @AuthenticationPrincipal User user) {
// // Check if the user is authorized to cancel this order
// OrderDTO orderDTO = orderService.getOrderById(orderId);
// if (!user.getRole().equals(Role.ADMIN) &&
// !orderDTO.getUserId().equals(user.getId())) {
// return new ResponseEntity<>(HttpStatus.FORBIDDEN);
// }

// orderService.cancelOrder(orderId);
// return ResponseEntity.noContent().build();
// }

// @DeleteMapping("/{orderId}")
// @PreAuthorize("hasRole('ADMIN')")
// @Operation(summary = "Delete an order (Admin only)")
// public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
// orderService.deleteOrder(orderId);
// return ResponseEntity.noContent().build();
// }
// }