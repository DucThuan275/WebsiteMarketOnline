package com.chuyendeweb2.group05.repo;

import com.chuyendeweb2.group05.entity.meta.Post;
import com.chuyendeweb2.group05.enums.PostStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByStatus(PostStatus status);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    // New method to find a post by its ID
    Optional<Post> findById(Long id);
}
