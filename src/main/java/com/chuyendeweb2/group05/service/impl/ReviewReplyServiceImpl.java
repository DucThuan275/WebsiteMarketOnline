package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.dto.ReviewReplyDTO;
import com.chuyendeweb2.group05.dto.ReviewReplyRequest;
import com.chuyendeweb2.group05.entity.meta.Review;
import com.chuyendeweb2.group05.entity.meta.ReviewReply;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.repo.ReviewReplyRepository;
import com.chuyendeweb2.group05.repo.ReviewRepository;
import com.chuyendeweb2.group05.service.ReviewReplyService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewReplyServiceImpl implements ReviewReplyService {

    private final ReviewReplyRepository replyRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public ReviewReplyDTO addReply(Long reviewId, User user, ReviewReplyRequest replyRequest, Boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        ReviewReply reply = ReviewReply.builder()
                .review(review)
                .user(user)
                .content(replyRequest.getContent())
                .isAdmin(isAdmin)
                .build();

        reply = replyRepository.save(reply);
        return mapToDTO(reply);
    }

    @Override
    @Transactional
    public ReviewReplyDTO updateReply(Long replyId, User user, ReviewReplyRequest replyRequest) {
        ReviewReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        if (!reply.getUser().equals(user)) {
            throw new RuntimeException("Unauthorized");
        }

        reply.setContent(replyRequest.getContent());
        reply = replyRepository.save(reply);
        return mapToDTO(reply);
    }

    @Override
    @Transactional
    public void deleteReply(Long replyId, User user) {
        ReviewReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        // Use isAdmin() method instead of getRoles()
        if (!reply.getUser().equals(user) && !user.isAdmin()) {
            throw new RuntimeException("Unauthorized");
        }

        replyRepository.delete(reply);
    }

    @Override
    public List<ReviewReplyDTO> getReviewReplies(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        return replyRepository.findByReviewOrderByCreatedAtAsc(review)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewReplyDTO mapToDTO(ReviewReply reply) {
        return ReviewReplyDTO.builder()
                .id(reply.getId())
                .reviewId(reply.getReview().getId())
                // Convert Integer to Long for userId
                .userId(reply.getUser().getId().longValue())
                .userName(reply.getUser().getUsername())
                .content(reply.getContent())
                .isAdmin(reply.getIsAdmin())
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .build();
    }
}