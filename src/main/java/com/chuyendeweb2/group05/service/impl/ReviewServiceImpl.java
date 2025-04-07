package com.chuyendeweb2.group05.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.dto.RatingStatsDTO;
import com.chuyendeweb2.group05.dto.ReviewDTO;
import com.chuyendeweb2.group05.dto.ReviewRequest;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.Review;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.repo.ProductRepository;
import com.chuyendeweb2.group05.repo.ReviewRepository;
import com.chuyendeweb2.group05.service.ReviewService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    public Page<ReviewDTO> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable)
                .map(this::mapToDTO); // This will map the reviews to DTOs
    }

    @Override
    @Transactional
    public ReviewDTO createReview(User user, ReviewRequest reviewRequest) {
        Product product = productRepository.findById(reviewRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(reviewRequest.getRating())
                .comment(reviewRequest.getComment())
                .verified(false)
                .build();
        review = reviewRepository.save(review);
        return mapToDTO(review);
    }

    @Override
    @Transactional
    public ReviewDTO updateReview(Long reviewId, User user, ReviewRequest reviewRequest) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getUser().equals(user)) {
            throw new RuntimeException("Unauthorized");
        }
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        return mapToDTO(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getUser().equals(user)) {
            throw new RuntimeException("Unauthorized");
        }
        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public void deleteReviewAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        reviewRepository.delete(review);
    }

    @Override
    public ReviewDTO getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    @Override
    public Page<ReviewDTO> getProductReviews(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return reviewRepository.findByProduct(product, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public Page<ReviewDTO> getVerifiedProductReviews(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return reviewRepository.findByProductAndVerified(product, true, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public List<ReviewDTO> getUserReviews(User user) {
        return reviewRepository.findByUser(user)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public boolean hasUserReviewedProduct(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return reviewRepository.findByUserAndProduct(user, product).isPresent();
    }

    @Override
    @Transactional
    public ReviewDTO verifyReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setVerified(true);
        return mapToDTO(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewDTO unverifyReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setVerified(false);
        return mapToDTO(reviewRepository.save(review));
    }

    @Override
    public RatingStatsDTO getProductRatingStats(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Review> reviews = reviewRepository.findByProduct(product);

        if (reviews.isEmpty()) {
            return RatingStatsDTO.builder()
                    .productId(productId)
                    .averageRating(0.0)
                    .totalReviews(0L)
                    .fiveStarCount(0L)
                    .fourStarCount(0L)
                    .threeStarCount(0L)
                    .twoStarCount(0L)
                    .oneStarCount(0L)
                    .build();
        }

        long totalReviews = reviews.size();
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        long fiveStarCount = reviews.stream().filter(r -> r.getRating() == 5).count();
        long fourStarCount = reviews.stream().filter(r -> r.getRating() == 4).count();
        long threeStarCount = reviews.stream().filter(r -> r.getRating() == 3).count();
        long twoStarCount = reviews.stream().filter(r -> r.getRating() == 2).count();
        long oneStarCount = reviews.stream().filter(r -> r.getRating() == 1).count();

        return RatingStatsDTO.builder()
                .productId(productId)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .fiveStarCount(fiveStarCount)
                .fourStarCount(fourStarCount)
                .threeStarCount(threeStarCount)
                .twoStarCount(twoStarCount)
                .oneStarCount(oneStarCount)
                .build();
    }

    @Override
    public Page<ReviewDTO> getReviewsByRating(Long productId, Integer rating, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.findByProductAndRating(product, rating, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public ReviewDTO markReviewAsHelpful(Long reviewId, User user) {
        // This would typically involve a many-to-many relationship between users and
        // reviews
        // For simplicity, we'll just return the review without implementing the full
        // functionality
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        return mapToDTO(review);
    }

    @Override
    @Transactional
    public ReviewDTO reportReview(Long reviewId, User user, String reason) {
        // This would typically involve creating a report entity
        // For simplicity, we'll just return the review without implementing the full
        // functionality
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        return mapToDTO(review);
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId().intValue())
                .userName(review.getUser().getUsername())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .verified(review.getVerified())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
