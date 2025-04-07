import callApi from "./apiService";

const ReviewService = {
  /**
   * Get all active reviews
   * @returns {Promise<Array>} List of all reviews
   */
  getAllReviews: async () => {
    return callApi("/reviews", "GET");
  },

  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.productId - Product ID
   * @param {number} reviewData.rating - Rating score (1-5)
   * @param {string} reviewData.comment - Review content
   * @returns {Promise<Object>} Created review information
   */
  createReview: async (reviewData) => {
    return callApi("/reviews", "POST", reviewData);
  },

  /**
   * Update a review by ID
   * @param {number} reviewId - ID of the review to update
   * @param {Object} reviewData - Updated data
   * @param {string} [reviewData.comment] - Review content
   * @param {number} [reviewData.rating] - Rating score
   * @returns {Promise<Object>} Updated review information
   */
  updateReview: async (reviewId, reviewData) => {
    return callApi(`/reviews/${reviewId}`, "PUT", reviewData);
  },

  /**
   * Delete a review by ID
   * @param {number} reviewId - ID of the review to delete
   * @returns {Promise<void>}
   */
  deleteReview: async (reviewId) => {
    return callApi(`/reviews/${reviewId}`, "DELETE");
  },

  /**
   * Get review information by ID
   * @param {number} reviewId - Review ID
   * @returns {Promise<Object>} Review information
   */
  getReviewById: async (reviewId) => {
    return callApi(`/reviews/${reviewId}`, "GET");
  },

  /**
   * Get reviews for a product with pagination
   * @param {number} productId - Product ID
   * @param {Object} pageable - Pagination information
   * @param {number} pageable.page - Page number (0-based)
   * @param {number} pageable.size - Page size
   * @returns {Promise<Object>} Paginated list of reviews
   */
  getProductReviews: async (productId, pageable) => {
    return callApi(
      `/reviews/product/${productId}?page=${pageable.page}&size=${pageable.size}`,
      "GET"
    );
  },

  /**
   * Get verified reviews for a product with pagination
   * @param {number} productId - Product ID
   * @param {Object} pageable - Pagination information
   * @param {number} pageable.page - Page number (0-based)
   * @param {number} pageable.size - Page size
   * @returns {Promise<Object>} Paginated list of verified reviews
   */
  getVerifiedProductReviews: async (productId, pageable) => {
    return callApi(
      `/reviews/product/${productId}/verified?page=${pageable.page}&size=${pageable.size}`,
      "GET"
    );
  },

  /**
   * Get reviews by current user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of user reviews
   */
  getUserReviews: async (userId) => {
    return callApi(`/reviews/user/${userId}`, "GET");
  },

  /**
   * Check if user has already reviewed a product
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {Promise<boolean>} True if user has reviewed, false otherwise
   */
  hasUserReviewedProduct: async (userId, productId) => {
    return callApi(
      `/reviews/product/${productId}/user-reviewed?userId=${userId}`,
      "GET"
    );
  },

  /**
   * Verify a review (mark as verified purchase)
   * @param {number} reviewId - ID of the review to verify
   * @returns {Promise<Object>} Verified review information
   */
  verifyReview: async (reviewId) => {
    return callApi(`/reviews/${reviewId}/verify`, "POST");
  },

  /**
   * Unverify a review
   * @param {number} reviewId - ID of the review to unverify
   * @returns {Promise<Object>} Unverified review information
   */
  unverifyReview: async (reviewId) => {
    return callApi(`/reviews/${reviewId}/unverify`, "POST");
  },

  /**
   * Get average rating for a product
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Rating statistics with average and count
   */
  getProductRatingStats: async (productId) => {
    return callApi(`/reviews/product/${productId}/stats`, "GET");
  },

  /**
   * Report a review as inappropriate or fake
   * @param {number} reviewId - ID of the review to report
   * @param {string} reason - Reason for reporting
   * @returns {Promise<Object>} Report confirmation
   */
  reportReview: async (reviewId, reason) => {
    return callApi(`/reviews/${reviewId}/report`, "POST", { reason });
  },

  /**
   * Get reviews filtered by rating
   * @param {number} productId - Product ID
   * @param {number} rating - Rating to filter by (1-5)
   * @param {Object} pageable - Pagination information
   * @returns {Promise<Object>} Filtered reviews
   */
  getReviewsByRating: async (productId, rating, pageable) => {
    return callApi(
      `/reviews/product/${productId}/rating/${rating}?page=${pageable.page}&size=${pageable.size}`,
      "GET"
    );
  },

  /**
   * Mark a review as helpful
   * @param {number} reviewId - Review ID
   * @returns {Promise<Object>} Updated review with helpful count
   */
  markReviewAsHelpful: async (reviewId) => {
    return callApi(`/reviews/${reviewId}/helpful`, "POST");
  },

  /**
   * Get replies for a review
   * @param {number} reviewId - Review ID
   * @returns {Promise<Array>} List of replies
   */
  getReviewReplies: async (reviewId) => {
    return callApi(`/reviews/${reviewId}/replies`, "GET");
  },

  /**
   * Add a reply to a review
   * @param {number} reviewId - Review ID
   * @param {Object} replyData - Reply content
   * @param {boolean} isAdmin - Whether the reply is from an admin
   * @returns {Promise<Object>} Created reply
   */
  addReply: async (reviewId, replyData, isAdmin = false) => {
    return callApi(
      `/reviews/${reviewId}/replies?isAdmin=${isAdmin}`,
      "POST",
      replyData
    );
  },

  /**
   * Delete a reply
   * @param {number} replyId - Reply ID
   * @returns {Promise<void>}
   */
  deleteReply: async (replyId) => {
    return callApi(`/reviews/replies/${replyId}`, "DELETE");
  },
};

export default ReviewService;
