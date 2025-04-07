package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.dto.FavoriteDTO;
import com.chuyendeweb2.group05.entity.meta.Favorite;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.repo.FavoriteRepository;
import com.chuyendeweb2.group05.repo.ProductRepository;
import com.chuyendeweb2.group05.service.FavoriteService;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public FavoriteDTO addFavorite(User user, Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }
        Product product = productOpt.get();

        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Product is already in favorites");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();
        favoriteRepository.save(favorite);

        return new FavoriteDTO(favorite.getId(), user.getId().intValue(), user.getUsername(), product.getId(),
                product.getName(), product.getImageUrl(), product.getPrice(), favorite.getCreatedAt());
    }

    @Override
    @Transactional
    public void removeFavorite(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<Favorite> favoriteOpt = favoriteRepository.findByUserAndProduct(user, product);
        favoriteOpt.ifPresent(favoriteRepository::delete);
    }

    @Override
    public Page<FavoriteDTO> getUserFavorites(User user, Pageable pageable) {
        return favoriteRepository.findByUser(user, pageable).map(favorite -> new FavoriteDTO(
                favorite.getId(),
                user.getId().intValue(),
                user.getUsername(),
                favorite.getProduct().getId(),
                favorite.getProduct().getName(),
                favorite.getProduct().getImageUrl(),
                favorite.getProduct().getPrice(),
                favorite.getCreatedAt()));
    }

    @Override
    public boolean isProductFavorited(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return favoriteRepository.existsByUserAndProduct(user, product);
    }

    @Override
    public long getFavoriteCount(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return favoriteRepository.countByProduct(product);
    }

}
