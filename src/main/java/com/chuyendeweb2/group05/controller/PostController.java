package com.chuyendeweb2.group05.controller;

import com.chuyendeweb2.group05.dto.PostCreateRequestDTO;
import com.chuyendeweb2.group05.dto.PostResponseDTO;
import com.chuyendeweb2.group05.entity.meta.Post;
import com.chuyendeweb2.group05.service.PostService;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.chuyendeweb2.group05.exception.ResourceNotFoundException;

import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponseDTO> createPost(
            @Valid @ModelAttribute PostCreateRequestDTO requestDTO,
            @RequestParam Integer userId,
            @RequestParam(required = false) MultipartFile imageFile) {
        try {
            PostResponseDTO response = postService.createPost(requestDTO, userId, imageFile);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<PostResponseDTO>> getAllPosts() {
        List<PostResponseDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<PostResponseDTO>> getPagedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<PostResponseDTO> posts = postService.getAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PostResponseDTO>> getAllActivePosts() {
        List<PostResponseDTO> activePosts = postService.getAllActivePosts();
        return ResponseEntity.ok(activePosts);
    }

    @GetMapping("/active/paged")
    public ResponseEntity<Page<PostResponseDTO>> getPagedActivePosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<PostResponseDTO> activePosts = postService.getAllActivePosts(pageable);
        return ResponseEntity.ok(activePosts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDTO> getPostById(@PathVariable Long id) {
        try {
            // Fetch post by ID using the service
            PostResponseDTO postResponseDTO = postService.getPostById(id);

            // Return the post details with 200 OK status
            return ResponseEntity.ok(postResponseDTO);
        } catch (ResourceNotFoundException ex) {
            // Return 404 Not Found if post doesn't exist
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null); // Optionally, you can send an error message
        }
    }

    @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponseDTO> updatePost(
            @PathVariable Long postId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile imageFile) {
        try {
            PostResponseDTO updatedPost = postService.updatePost(postId, title, content, imageFile);
            return ResponseEntity.ok(updatedPost);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        try {
            postService.deletePost(postId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @PatchMapping("/{postId}/status")
    public ResponseEntity<?> updatePostStatus(
            @PathVariable Long postId,
            @RequestParam String status) {
        try {
            PostResponseDTO updatedPost = postService.updatePostStatus(postId, status);
            return ResponseEntity.ok(updatedPost);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest() // 400 Bad Request
                    .body(e.getMessage());
        }
    }

    // API lấy hình ảnh Post theo ID
    @GetMapping("/image/{id}")
    public ResponseEntity<Resource> getPostImage(@PathVariable Long id) {
        try {
            Post post = postService.getPostId(id);
            String imageName = post.getImagePost(); // Lấy tên file hình ảnh từ post
            Resource imageResource = postService.getImageAsResource(imageName); // Đọc tệp ảnh từ hệ thống

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