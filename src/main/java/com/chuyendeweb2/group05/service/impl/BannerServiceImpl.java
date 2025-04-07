package com.chuyendeweb2.group05.service.impl;

import com.chuyendeweb2.group05.entity.meta.Banner;
import com.chuyendeweb2.group05.repo.BannerRepository;
import com.chuyendeweb2.group05.service.BannerService;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.UUID;

@Service
public class BannerServiceImpl implements BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Value("${project.image}")
    private String uploadDir;

    @Override
    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Override
    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }

    // Phương thức đọc hình ảnh từ file và trả về mảng byte
    public Resource getImageAsResource(String imageName) throws IOException {
        Path imagePath = Paths.get(uploadDir).resolve(imageName);
        if (Files.exists(imagePath)) {
            byte[] imageBytes = Files.readAllBytes(imagePath);
            return new ByteArrayResource(imageBytes);
        }
        throw new IOException("Image not found");
    }

    @Override
    public Banner createBanner(Banner banner, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = saveImage(imageFile);
            banner.setImageUrl(fileName);
        }
        return bannerRepository.save(banner);
    }

    @Override
    public Banner updateBanner(Long id, Banner bannerDetails, MultipartFile imageFile) throws IOException {
        Banner banner = getBannerById(id);

        banner.setTitle(bannerDetails.getTitle());
        banner.setLinkUrl(bannerDetails.getLinkUrl());
        banner.setDescription(bannerDetails.getDescription());
        banner.setDisplayOrder(bannerDetails.getDisplayOrder());

        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old image if exists
            if (banner.getImageUrl() != null) {
                deleteImage(banner.getImageUrl());
            }

            String fileName = saveImage(imageFile);
            banner.setImageUrl(fileName);
        }

        return bannerRepository.save(banner);
    }

    @Override
    public Banner updateBannerStatus(Long id, Boolean isActive) {
        Banner banner = getBannerById(id);
        banner.setIsActive(isActive);
        return bannerRepository.save(banner);
    }

    @Override
    public void deleteBanner(Long id) {
        Banner banner = getBannerById(id);

        // Delete image file
        if (banner.getImageUrl() != null) {
            deleteImage(banner.getImageUrl());
        }

        bannerRepository.delete(banner);
    }

    @Override
    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveTrue();
    }

    private String saveImage(MultipartFile imageFile) throws IOException {
        // Create directory if it doesn't exist
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        // Save file
        Files.copy(imageFile.getInputStream(), filePath);

        return fileName;
    }

    private void deleteImage(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log the error but don't throw exception
            System.err.println("Failed to delete image: " + fileName);
        }
    }
}