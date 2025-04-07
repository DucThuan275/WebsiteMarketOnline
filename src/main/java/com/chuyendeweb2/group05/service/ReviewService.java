package com.chuyendeweb2.group05.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.chuyendeweb2.group05.dto.RatingStatsDTO;
import com.chuyendeweb2.group05.dto.ReviewDTO;
import com.chuyendeweb2.group05.dto.ReviewRequest;
import com.chuyendeweb2.group05.entity.meta.User;

import java.util.List;

public interface ReviewService {
    Page<ReviewDTO> getAllReviews(Pageable pageable);

    ReviewDTO createReview(User user, ReviewRequest reviewRequest);

    ReviewDTO updateReview(Long reviewId, User user, ReviewRequest reviewRequest);

    void deleteReview(Long reviewId, User user);

    ReviewDTO getReviewById(Long reviewId);

    Page<ReviewDTO> getProductReviews(Long productId, Pageable pageable);

    Page<ReviewDTO> getVerifiedProductReviews(Long productId, Pageable pageable);

    List<ReviewDTO> getUserReviews(User user);

    boolean hasUserReviewedProduct(User user, Long productId);

    ReviewDTO verifyReview(Long reviewId);

    ReviewDTO unverifyReview(Long reviewId);

    // New methods
    RatingStatsDTO getProductRatingStats(Long productId);

    Page<ReviewDTO> getReviewsByRating(Long productId, Integer rating, Pageable pageable);

    ReviewDTO markReviewAsHelpful(Long reviewId, User user);

    ReviewDTO reportReview(Long reviewId, User user, String reason);

    void deleteReviewAdmin(Long reviewId);
}
