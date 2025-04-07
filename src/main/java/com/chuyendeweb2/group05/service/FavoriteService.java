package com.chuyendeweb2.group05.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.chuyendeweb2.group05.dto.FavoriteDTO;
import com.chuyendeweb2.group05.entity.meta.User;

public interface FavoriteService {
    FavoriteDTO addFavorite(User user, Long productId);
    void removeFavorite(User user, Long productId);
    Page<FavoriteDTO> getUserFavorites(User user, Pageable pageable);
    boolean isProductFavorited(User user, Long productId);
    long getFavoriteCount(Long productId);
}