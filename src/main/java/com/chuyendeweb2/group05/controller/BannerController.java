package com.chuyendeweb2.group05.controller;

import com.chuyendeweb2.group05.entity.meta.Banner;
import com.chuyendeweb2.group05.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @GetMapping("/list-banner")
    public ResponseEntity<List<Banner>> getActiveBanners() {
        List<Banner> banners = bannerService.getActiveBanners();
        return ResponseEntity.ok(banners);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admin can access these endpoints
    public ResponseEntity<List<Banner>> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admin can access these endpoints
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        Banner banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(banner);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admin can access these endpoints
    public ResponseEntity<Banner> createBanner(
            @ModelAttribute Banner banner,
            @RequestParam("image") MultipartFile imageFile) throws IOException {
        Banner newBanner = bannerService.createBanner(banner, imageFile);
        return new ResponseEntity<>(newBanner, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admin can access these endpoints
    public ResponseEntity<Banner> updateBanner(
            @PathVariable Long id,
            @ModelAttribute Banner banner,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) throws IOException {
        Banner updatedBanner = bannerService.updateBanner(id, banner, imageFile);
        return ResponseEntity.ok(updatedBanner);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admin can access these endpoints
    public ResponseEntity<Banner> updateBannerStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        Banner updatedBanner = bannerService.updateBannerStatus(id, isActive);
        return ResponseEntity.ok(updatedBanner);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admin can access these endpoints
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    // API lấy hình ảnh banner theo ID
    @GetMapping("/image/{id}")
    public ResponseEntity<Resource> getBannerImage(@PathVariable Long id) {
        try {
            Banner banner = bannerService.getBannerById(id);
            String imageName = banner.getImageUrl(); // Lấy tên file hình ảnh từ banner
            Resource imageResource = bannerService.getImageAsResource(imageName); // Đọc tệp ảnh từ hệ thống

            // Xác định kiểu MIME (Content-Type) của file (nếu bạn sử dụng JPEG hoặc PNG)
            String contentType = "image/jpeg"; // Bạn có thể thay đổi theo loại hình ảnh của bạn (ví dụ PNG)
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imageName + "\"")
                    .body(imageResource);

        } catch (IOException e) {
            return ResponseEntity.notFound().build(); // Trả về lỗi nếu không tìm thấy file ảnh
        }
    }

}
