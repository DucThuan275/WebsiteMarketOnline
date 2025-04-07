package com.chuyendeweb2.group05.service;

import com.chuyendeweb2.group05.dto.PostCreateRequestDTO;
import com.chuyendeweb2.group05.dto.PostResponseDTO;
import com.chuyendeweb2.group05.entity.meta.Post;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface PostService {

    PostResponseDTO createPost(PostCreateRequestDTO requestDTO, Integer userId, MultipartFile imageFile)
            throws IOException;

    default PostResponseDTO createPost(PostCreateRequestDTO requestDTO, Integer userId) {
        try {
            return createPost(requestDTO, userId, null);
        } catch (IOException e) {
            throw new RuntimeException("Error processing post creation", e);
        }
    }

    PostResponseDTO updatePost(Long postId, String title, String content, MultipartFile imageFile) throws IOException;

    // Keep only one method for getting post by ID
    PostResponseDTO getPostById(Long id);

    // Keep only one method for getting post by ID
    Post getPostId(Long id);

    void deletePost(Long postId);

    PostResponseDTO updatePostStatus(Long postId, String status);

    Resource getImageAsResource(String imageName) throws IOException;

    List<PostResponseDTO> getAllPosts();

    Page<PostResponseDTO> getAllPosts(Pageable pageable);

    List<PostResponseDTO> getAllActivePosts();

    Page<PostResponseDTO> getAllActivePosts(Pageable pageable);
}
