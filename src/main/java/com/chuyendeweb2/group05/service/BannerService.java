package com.chuyendeweb2.group05.service;

import com.chuyendeweb2.group05.entity.meta.Banner;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface BannerService {
    // Admin-only operations
    List<Banner> getAllBanners();

    Banner getBannerById(Long id);

    Banner createBanner(Banner banner, MultipartFile imageFile) throws IOException;

    Banner updateBanner(Long id, Banner banner, MultipartFile imageFile) throws IOException;

    Banner updateBannerStatus(Long id, Boolean isActive);

    void deleteBanner(Long id);

    // Public operations
    List<Banner> getActiveBanners();

    // Method to fetch the image as a resource
    Resource getImageAsResource(String imageName) throws IOException;
}