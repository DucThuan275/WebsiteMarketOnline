package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.dto.OrderDTO;
import com.chuyendeweb2.group05.dto.OrderDetailDTO;
import com.chuyendeweb2.group05.dto.OrderRequest;
import com.chuyendeweb2.group05.dto.OrderStatusUpdateRequest;
import com.chuyendeweb2.group05.entity.meta.*;
import com.chuyendeweb2.group05.enums.OrderStatus;
import com.chuyendeweb2.group05.enums.PaymentStatus;
import com.chuyendeweb2.group05.exception.ResourceNotFoundException;
import com.chuyendeweb2.group05.repo.CartRepository;
import com.chuyendeweb2.group05.repo.OrderDetailRepository;
import com.chuyendeweb2.group05.repo.OrderRepository;
import com.chuyendeweb2.group05.service.OrderService;
import com.chuyendeweb2.group05.service.WalletService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CartRepository cartRepository;
    private final WalletService walletService; // Add the wallet service

    @Override
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO createOrderFromCart(User user, OrderRequest orderRequest) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        if (cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Cannot create order from empty cart");
        }

        Order order = Order.builder()
                .user(user)
                .shippingAddress(orderRequest.getShippingAddress())
                .contactPhone(orderRequest.getContactPhone())
                .status(OrderStatus.PENDING)
                .paymentMethod(orderRequest.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .totalAmount(cart.getTotalAmount())
                .build();

        orderRepository.save(order);

        // Transfer cart items to order details
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            // Kiểm tra xem có đủ số lượng trong kho không
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalStateException("Not enough stock for product: " + product.getName());
            }

            // Giảm số lượng tồn kho
            product.reduceStock(cartItem.getQuantity());

            // Lấy thông tin sản phẩm trực tiếp từ đối tượng product
            String productName = product.getName();
            String productDescription = product.getDescription();

            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .productName(productName) // Sử dụng giá trị thực từ sản phẩm
                    .productDescription(productDescription) // Sử dụng giá trị thực từ sản phẩm
                    .build();

            order.addOrderDetail(orderDetail);
        }

        // Clear the cart after creating the order
        cart.clearCart();
        cartRepository.save(cart);

        return mapOrderToDTO(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Only allow cancellation for pending or processing orders
        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.PROCESSING) {
            // Trả lại số lượng tồn kho cho các sản phẩm
            for (OrderDetail orderDetail : order.getOrderDetails()) {
                Product product = orderDetail.getProduct();
                product.increaseStock(orderDetail.getQuantity());
            }

            order.setStatus(OrderStatus.CANCELLED);
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            orderRepository.save(order);
        } else {
            throw new IllegalStateException("Cannot cancel an order that is already " + order.getStatus());
        }
    }

    @Override
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapOrderToDTO(order);
    }

    @Override
    public List<OrderDTO> getUserOrders(User user) {
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return orders.stream()
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return orders.stream()
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersBetweenDates(LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);
        return orders.stream()
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatusUpdateRequest statusUpdate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(statusUpdate.getStatus());

        // Cập nhật trạng thái thanh toán khi đơn hàng đã giao
        if (statusUpdate.getStatus() == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);

            // Xử lý thanh toán cho người bán khi đơn hàng đã giao
            if (oldStatus != OrderStatus.DELIVERED) {
                walletService.processOrderPayment(order); // Gọi phương thức xử lý thanh toán
            }
        }

        // Cập nhật trạng thái thanh toán nếu đơn hàng bị hủy
        if (statusUpdate.getStatus() == OrderStatus.CANCELLED) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        return mapOrderToDTO(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }

    private OrderDTO mapOrderToDTO(Order order) {
        List<OrderDetailDTO> orderDetailDTOs = order.getOrderDetails().stream()
                .map(this::mapOrderDetailToDTO)
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .contactPhone(order.getContactPhone())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderDetails(orderDetailDTOs)
                .build();
    }

    private OrderDetailDTO mapOrderDetailToDTO(OrderDetail orderDetail) {
        BigDecimal subtotal = orderDetail.getPrice().multiply(BigDecimal.valueOf(orderDetail.getQuantity()));

        return OrderDetailDTO.builder()
                .id(orderDetail.getId())
                .orderId(orderDetail.getOrder().getId())
                .productId(orderDetail.getProduct().getId())
                .productName(orderDetail.getProductName()) // Sử dụng giá trị đã lưu trong orderDetail
                .productDescription(orderDetail.getProductDescription()) // Sử dụng giá trị đã lưu trong orderDetail
                .quantity(orderDetail.getQuantity())
                .price(orderDetail.getPrice())
                .subtotal(subtotal)
                .build();
    }
}
