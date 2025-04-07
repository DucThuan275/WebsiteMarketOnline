package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.RatingStatsDTO;
import com.chuyendeweb2.group05.dto.ReviewDTO;
import com.chuyendeweb2.group05.dto.ReviewReplyDTO;
import com.chuyendeweb2.group05.dto.ReviewReplyRequest;
import com.chuyendeweb2.group05.dto.ReviewRequest;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.service.ReviewReplyService;
import com.chuyendeweb2.group05.service.ReviewService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@Tag(name = "Review", description = "API quản lý danh sách đánh giá")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewReplyService replyService;

    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getAllReviews(Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getAllReviews(pageable);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Tạo mới một đánh giá
     * 
     * @param user          Người dùng thực hiện đánh giá
     * @param reviewRequest Dữ liệu đánh giá
     * @return ReviewDTO chứa thông tin đánh giá đã tạo
     */
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@AuthenticationPrincipal User user,
            @RequestBody ReviewRequest reviewRequest) {
        return ResponseEntity.ok(reviewService.createReview(user, reviewRequest));
    }

    /**
     * Cập nhật đánh giá dựa trên ID
     * 
     * @param reviewId      ID của đánh giá cần cập nhật
     * @param user          Người dùng thực hiện cập nhật
     * @param reviewRequest Dữ liệu cập nhật
     * @return ReviewDTO chứa thông tin đánh giá đã cập nhật
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable Long reviewId,
            @AuthenticationPrincipal User user,
            @RequestBody ReviewRequest reviewRequest) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, user, reviewRequest));
    }

    /**
     * Xóa một đánh giá dựa trên ID
     * 
     * @param reviewId ID của đánh giá cần xóa
     * @param user     Người dùng thực hiện xóa
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @AuthenticationPrincipal User user) {
        reviewService.deleteReview(reviewId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xóa một đánh giá dựa trên ID (Admin)
     * 
     * @param reviewId ID của đánh giá cần xóa
     */
    @DeleteMapping("/{reviewId}/admin")
    public ResponseEntity<Void> deleteReviewAdmin(@PathVariable Long reviewId) {
        reviewService.deleteReviewAdmin(reviewId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy thông tin đánh giá theo ID
     * 
     * @param reviewId ID của đánh giá
     * @return ReviewDTO chứa thông tin đánh giá
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    /**
     * Lấy danh sách đánh giá của một sản phẩm
     * 
     * @param productId ID của sản phẩm
     * @param pageable  Thông tin phân trang
     * @return Page<ReviewDTO> danh sách đánh giá
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewDTO>> getProductReviews(@PathVariable Long productId, Pageable pageable) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, pageable));
    }

    /**
     * Lấy danh sách đánh giá đã được xác minh của một sản phẩm
     * 
     * @param productId ID của sản phẩm
     * @param pageable  Thông tin phân trang
     * @return Page<ReviewDTO> danh sách đánh giá đã xác minh
     */
    @GetMapping("/product/{productId}/verified")
    public ResponseEntity<Page<ReviewDTO>> getVerifiedProductReviews(@PathVariable Long productId, Pageable pageable) {
        return ResponseEntity.ok(reviewService.getVerifiedProductReviews(productId, pageable));
    }

    /**
     * Lấy danh sách đánh giá của người dùng hiện tại
     * 
     * @param user Người dùng hiện tại
     * @return List<ReviewDTO> danh sách đánh giá của người dùng
     */
    @GetMapping("/user")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.getUserReviews(user));
    }

    /**
     * Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
     * 
     * @param user      Người dùng hiện tại
     * @param productId ID của sản phẩm
     * @return Boolean - true nếu đã đánh giá, false nếu chưa
     */
    @GetMapping("/product/{productId}/user-reviewed")
    public ResponseEntity<Boolean> hasUserReviewedProduct(@AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.hasUserReviewedProduct(user, productId));
    }

    /**
     * Xác minh một đánh giá
     * 
     * @param reviewId ID của đánh giá cần xác minh
     * @return ReviewDTO sau khi xác minh
     */
    @PostMapping("/{reviewId}/verify")
    public ResponseEntity<ReviewDTO> verifyReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.verifyReview(reviewId));
    }

    /**
     * Hủy xác minh một đánh giá
     * 
     * @param reviewId ID của đánh giá cần hủy xác minh
     * @return ReviewDTO sau khi hủy xác minh
     */
    @PostMapping("/{reviewId}/unverify")
    public ResponseEntity<ReviewDTO> unverifyReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.unverifyReview(reviewId));
    }

    /**
     * Lấy thống kê đánh giá cho một sản phẩm
     * 
     * @param productId ID của sản phẩm
     * @return RatingStatsDTO thống kê đánh giá
     */
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<RatingStatsDTO> getProductRatingStats(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductRatingStats(productId));
    }

    /**
     * Lấy đánh giá theo số sao
     * 
     * @param productId ID của sản phẩm
     * @param rating    Số sao (1-5)
     * @param pageable  Thông tin phân trang
     * @return Page<ReviewDTO> danh sách đánh giá
     */
    @GetMapping("/product/{productId}/rating/{rating}")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByRating(
            @PathVariable Long productId,
            @PathVariable Integer rating,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByRating(productId, rating, pageable));
    }

    /**
     * Đánh dấu một đánh giá là hữu ích
     * 
     * @param reviewId ID của đánh giá
     * @param user     Người dùng thực hiện đánh dấu
     * @return ReviewDTO sau khi đánh dấu
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ReviewDTO> markReviewAsHelpful(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.markReviewAsHelpful(reviewId, user));
    }

    /**
     * Báo cáo một đánh giá không phù hợp
     * 
     * @param reviewId ID của đánh giá
     * @param user     Người dùng thực hiện báo cáo
     * @param reason   Lý do báo cáo
     * @return ReviewDTO sau khi báo cáo
     */
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<ReviewDTO> reportReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        return ResponseEntity.ok(reviewService.reportReview(reviewId, user, reason));
    }

    /**
     * Thêm phản hồi cho một đánh giá
     * 
     * @param reviewId     ID của đánh giá
     * @param user         Người dùng thực hiện phản hồi
     * @param replyRequest Nội dung phản hồi
     * @param isAdmin      Có phải là admin hay không
     * @return ReviewReplyDTO sau khi thêm phản hồi
     */
    @PostMapping("/{reviewId}/replies")
    public ResponseEntity<ReviewReplyDTO> addReply(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user,
            @RequestBody ReviewReplyRequest replyRequest,
            @RequestParam(defaultValue = "false") Boolean isAdmin) {
        return ResponseEntity.ok(replyService.addReply(reviewId, user, replyRequest, isAdmin));
    }

    /**
     * Cập nhật phản hồi
     * 
     * @param replyId      ID của phản hồi
     * @param user         Người dùng thực hiện cập nhật
     * @param replyRequest Nội dung cập nhật
     * @return ReviewReplyDTO sau khi cập nhật
     */
    @PutMapping("/replies/{replyId}")
    public ResponseEntity<ReviewReplyDTO> updateReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal User user,
            @RequestBody ReviewReplyRequest replyRequest) {
        return ResponseEntity.ok(replyService.updateReply(replyId, user, replyRequest));
    }

    /**
     * Xóa phản hồi
     * 
     * @param replyId ID của phản hồi
     * @param user    Người dùng thực hiện xóa
     */
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal User user) {
        replyService.deleteReply(replyId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách phản hồi cho một đánh giá
     * 
     * @param reviewId ID của đánh giá
     * @return List<ReviewReplyDTO> danh sách phản hồi
     */
    @GetMapping("/{reviewId}/replies")
    public ResponseEntity<List<ReviewReplyDTO>> getReviewReplies(@PathVariable Long reviewId) {
        return ResponseEntity.ok(replyService.getReviewReplies(reviewId));
    }
}
