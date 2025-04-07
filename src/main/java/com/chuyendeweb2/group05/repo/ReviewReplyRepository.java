package com.chuyendeweb2.group05.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chuyendeweb2.group05.entity.meta.Review;
import com.chuyendeweb2.group05.entity.meta.ReviewReply;

import java.util.List;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
    List<ReviewReply> findByReviewOrderByCreatedAtAsc(Review review);
}
