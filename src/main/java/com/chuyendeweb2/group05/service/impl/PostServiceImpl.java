package com.chuyendeweb2.group05.service.impl;

import com.chuyendeweb2.group05.dto.PostCreateRequestDTO;
import com.chuyendeweb2.group05.dto.PostResponseDTO;
import com.chuyendeweb2.group05.entity.meta.Post;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.enums.PostStatus;
import com.chuyendeweb2.group05.exception.ResourceNotFoundException;
import com.chuyendeweb2.group05.repo.PostRepository;
import com.chuyendeweb2.group05.repo.UserRepository;
import com.chuyendeweb2.group05.service.PostService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    @Value("${project.image}")
    private String uploadDir;

    @Override
    public Post getPostId(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }

    @Override
    public PostResponseDTO getPostById(Long postId) {
        // Fetch the post by ID
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Return the mapped PostResponseDTO
        return mapToPostResponseDTO(post);
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
    @Transactional
    public PostResponseDTO createPost(PostCreateRequestDTO requestDTO, Integer userId,
            MultipartFile imageFile) throws IOException {
        if (requestDTO.getContent() == null || requestDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Post content cannot be empty");
        }
        // Tìm user từ DB
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Post post = Post.builder()
                .title(requestDTO.getTitle())
                .content(requestDTO.getContent())
                .author(author)
                .status(PostStatus.PENDING)
                .build();

        // Handle primary image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = saveImage(imageFile);
            post.setThumbnailUrl(fileName);
        } else if (requestDTO.getThumbnailUrl() != null && !requestDTO.getThumbnailUrl().isEmpty()) {
            post.setThumbnailUrl(requestDTO.getThumbnailUrl());
        }

        // Save the post first to get an ID
        post = postRepository.save(post);

        return mapToPostResponseDTO(post);
    }

    @Override
    @Transactional
    public PostResponseDTO updatePost(Long postId, String title, String content, MultipartFile imageFile)
            throws IOException {
        // Find the post to update
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Update the post fields
        if (title != null) {
            post.setTitle(title);
        }

        if (content != null) {
            post.setContent(content);
        }

        // Handle image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = saveImage(imageFile);
            post.setThumbnailUrl(fileName);
        }

        // Save the updated post
        post = postRepository.save(post);

        // Map and return the response
        return mapToPostResponseDTO(post);
    }

    @Override
    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Delete the post
        postRepository.delete(post);
    }

    @Override
    @Transactional
    public PostResponseDTO updatePostStatus(Long postId, String statusValue) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        try {
            // Convert the string status to enum
            PostStatus status = PostStatus.valueOf(statusValue.toUpperCase());

            // Update the post status
            post.setStatus(status);
            post = postRepository.save(post);

            return mapToPostResponseDTO(post);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid post status: " + statusValue);
        }
    }

    @Override
    public List<PostResponseDTO> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(this::mapToPostResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PostResponseDTO> getAllPosts(Pageable pageable) {
        Page<Post> postPage = postRepository.findAll(pageable);
        return postPage.map(this::mapToPostResponseDTO);
    }

    @Override
    public List<PostResponseDTO> getAllActivePosts() {
        List<Post> activePosts = postRepository.findByStatus(PostStatus.ACTIVE);
        return activePosts.stream()
                .map(this::mapToPostResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PostResponseDTO> getAllActivePosts(Pageable pageable) {
        Page<Post> activePostPage = postRepository.findByStatus(PostStatus.ACTIVE, pageable);
        return activePostPage.map(this::mapToPostResponseDTO);
    }

    private String saveImage(MultipartFile imageFile) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            if (!directory.mkdirs()) {
                throw new IOException("Failed to create directory for image uploads");
            }
        }

        String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        // Kiểm tra quyền ghi vào thư mục
        if (!Files.isWritable(filePath.getParent())) {
            throw new IOException("Directory is not writable");
        }

        Files.copy(imageFile.getInputStream(), filePath);
        return fileName;
    }

    // Helper method to delete an image
    private void deleteImage(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log the error but don't throw exception
            System.err.println("Failed to delete image: " + fileName);
        }
    }

    // Map Entity to DTO
    private PostResponseDTO mapToPostResponseDTO(Post post) {
        // Implement your mapping logic to convert Post entity to PostResponseDTO
        return PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getUsername()) // Assuming User has username field
                .thumbnailUrl(post.getThumbnailUrl())
                .status(post.getStatus().toString())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}