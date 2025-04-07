package com.chuyendeweb2.group05.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.chuyendeweb2.group05.dto.CartItemRequestDTO;
import com.chuyendeweb2.group05.dto.CartItemResponseDTO;
import com.chuyendeweb2.group05.dto.CartResponseDTO;
import com.chuyendeweb2.group05.entity.meta.Cart;
import com.chuyendeweb2.group05.entity.meta.CartItem;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.repo.CartItemRepository;
import com.chuyendeweb2.group05.repo.CartRepository;
import com.chuyendeweb2.group05.repo.ProductRepository;
import com.chuyendeweb2.group05.repo.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public List<CartResponseDTO> getAllCarts() {
        // Lấy toàn bộ giỏ hàng
        List<Cart> carts = cartRepository.findAll();

        return carts.stream()
                // Explicitly specify the return type as CartResponseDTO
                .map((Cart cart) -> {
                    // Lấy thông tin user từ cart và kiểm tra null
                    User user = cart.getUser();
                    if (user == null) {
                        // Handle case where user is null (e.g., set default values)
                        user = new User();
                    }

                    // Lấy danh sách CartItem và ánh xạ thông tin cần thiết
                    List<CartItemResponseDTO> itemDTOs = cart.getCartItems().stream()
                            .map(cartItem -> {
                                Product product = cartItem.getProduct();
                                return CartItemResponseDTO.builder()
                                        .id(cartItem.getId())
                                        .productId(product != null ? product.getId() : -1L) // Default value if product
                                                                                            // is null
                                        .productName(product != null ? product.getName() : "Unknown Product")
                                        .productPrice(product != null ? product.getPrice() : BigDecimal.ZERO) // Default
                                                                                                              // if null
                                        .quantity(cartItem.getQuantity())
                                        .totalPrice(
                                                product != null
                                                        ? product.getPrice()
                                                                .multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                                                        : BigDecimal.ZERO)
                                        .stockQuantity(product != null ? product.getStockQuantity() : 0) // Default if
                                                                                                         // null
                                        .build();
                            })
                            .collect(Collectors.toList());

                    // Trả về CartResponseDTO chỉ với các trường cần thiết
                    return CartResponseDTO.builder()
                            .id(cart.getId())
                            .userId(user.getId()) // Chỉ lấy userId, default if null
                            .totalAmount(cart.getTotalAmount() != null ? cart.getTotalAmount() : BigDecimal.ZERO) // Handle
                                                                                                                  // null
                                                                                                                  // total
                                                                                                                  // amount
                            .totalItems(itemDTOs.size()) // Tổng số sản phẩm trong giỏ
                            .items(itemDTOs) // Ensure items are included
                            .build();
                })
                .collect(Collectors.toList()); // Collect the results into a list
    }

    @Transactional
    public CartResponseDTO getCartByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createCart(user));

        return mapToCartResponseDTO(cart);
    }

    @Transactional
    public CartResponseDTO addItemToCart(Integer userId, CartItemRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));

        // Check if product is in stock
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough stock available for product: " + product.getName());
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createCart(user));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .product(product)
                            .quantity(0)
                            .sellerId(product.getSeller().getId().longValue()) // Cast to Long if needed
                            .build();
                    return newItem;
                });

        // Update quantity
        cartItem.updateQuantity(cartItem.getQuantity() + request.getQuantity());
        cartItemRepository.save(cartItem);

        // Update cart total
        cart.calculateTotalAmount();
        cartRepository.save(cart);

        return mapToCartResponseDTO(cart);
    }

    // @Transactional
    // public CartResponseDTO addItemToCart(Integer userId, CartItemRequestDTO
    // request) {
    // User user = userRepository.findById(userId)
    // .orElseThrow(() -> new EntityNotFoundException("User not found with id: " +
    // userId));

    // Product product = productRepository.findById(request.getProductId())
    // .orElseThrow(() -> new EntityNotFoundException("Product not found with id: "
    // + request.getProductId()));

    // // Check if product is in stock
    // if (product.getStockQuantity() < request.getQuantity()) {
    // throw new IllegalArgumentException("Not enough stock available for product: "
    // + product.getName());
    // }

    // Cart cart = cartRepository.findByUser(user)
    // .orElseGet(() -> createCart(user));

    // CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
    // .orElseGet(() -> {
    // CartItem newItem = CartItem.builder()
    // .cart(cart)
    // .product(product)
    // .quantity(0)
    // .build();
    // return newItem;
    // });

    // // Update quantity
    // cartItem.updateQuantity(cartItem.getQuantity() + request.getQuantity());
    // cartItemRepository.save(cartItem);

    // // Update cart total
    // cart.calculateTotalAmount();
    // cartRepository.save(cart);

    // return mapToCartResponseDTO(cart);
    // }

    @Transactional
    public CartResponseDTO updateCartItem(Integer userId, Long itemId, CartItemRequestDTO request) {
        Cart cart = getCartForUser(userId);

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found with id: " + itemId));

        // Validate cart item belongs to the user
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to this user");
        }

        Product product = cartItem.getProduct();

        // Check if product is in stock for the updated quantity
        if (request.getQuantity() > 0) {
            if (product.getStockQuantity() < request.getQuantity()) {
                throw new IllegalArgumentException("Not enough stock available for product: " + product.getName());
            }
            cartItem.updateQuantity(request.getQuantity());
        } else {
            cartItemRepository.delete(cartItem);
        }

        // Recalculate cart total
        cart.calculateTotalAmount();
        cartRepository.save(cart);

        return mapToCartResponseDTO(cart);
    }

    @Transactional
    public CartResponseDTO removeItemFromCart(Integer userId, Long itemId) {
        // Get the cart for the user
        Cart cart = getCartForUser(userId);

        // Find the cart item to remove
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found with id: " + itemId));

        // Validate that the cart item belongs to the user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to this user");
        }

        // Remove association from both sides
        cart.getCartItems().remove(cartItem);
        cartItem.setCart(null);

        // Delete the cart item
        cartItemRepository.delete(cartItem);

        // Recalculate the total amount
        cart.calculateTotalAmount();

        // Save the updated cart
        cartRepository.save(cart);

        // Return the updated CartResponseDTO
        return mapToCartResponseDTO(cart);
    }

    @Transactional
    public void clearCart(Integer userId) {
        Cart cart = getCartForUser(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.clearCart();
        cartRepository.save(cart);
    }

    private Cart createCart(User user) {
        Cart cart = Cart.builder()
                .user(user)
                .totalAmount(BigDecimal.ZERO)
                .build();
        return cartRepository.save(cart);
    }

    private Cart getCartForUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        return cartRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user: " + userId));
    }

    private CartResponseDTO mapToCartResponseDTO(Cart cart) {
        List<CartItemResponseDTO> itemDTOs = cart.getCartItems().stream()
                .map(this::mapToCartItemResponseDTO)
                .collect(Collectors.toList());

        return CartResponseDTO.builder()
                .id(cart.getId())
                .items(itemDTOs)
                .totalAmount(cart.getTotalAmount())
                .totalItems(itemDTOs.size())
                .build();
    }

    private CartItemResponseDTO mapToCartItemResponseDTO(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemResponseDTO.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImageUrl(product.getImageUrl())
                .productPrice(product.getPrice())
                .quantity(cartItem.getQuantity())
                .totalPrice(totalPrice)
                .build();
    }

}
