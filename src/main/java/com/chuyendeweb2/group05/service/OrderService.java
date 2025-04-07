package com.chuyendeweb2.group05.service;

import java.time.LocalDateTime;
import java.util.List;

import com.chuyendeweb2.group05.dto.OrderDTO;
import com.chuyendeweb2.group05.dto.OrderRequest;
import com.chuyendeweb2.group05.dto.OrderStatusUpdateRequest;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.OrderStatus;

public interface OrderService {
    OrderDTO createOrderFromCart(User user, OrderRequest orderRequest);

    OrderDTO getOrderById(Long orderId);

    List<OrderDTO> getUserOrders(User user);

    List<OrderDTO> getOrdersByStatus(OrderStatus status);

    List<OrderDTO> getOrdersBetweenDates(LocalDateTime start, LocalDateTime end);

    OrderDTO updateOrderStatus(Long orderId, OrderStatusUpdateRequest statusUpdate);

    void cancelOrder(Long orderId);

    void deleteOrder(Long orderId);

    List<OrderDTO> getAllOrders();
}