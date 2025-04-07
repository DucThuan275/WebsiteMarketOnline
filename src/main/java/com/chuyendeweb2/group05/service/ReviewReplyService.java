package com.chuyendeweb2.group05.service;

import java.util.List;

import com.chuyendeweb2.group05.dto.ReviewReplyDTO;
import com.chuyendeweb2.group05.dto.ReviewReplyRequest;
import com.chuyendeweb2.group05.entity.meta.User;

public interface ReviewReplyService {
    ReviewReplyDTO addReply(Long reviewId, User user, ReviewReplyRequest replyRequest, Boolean isAdmin);

    ReviewReplyDTO updateReply(Long replyId, User user, ReviewReplyRequest replyRequest);

    void deleteReply(Long replyId, User user);

    List<ReviewReplyDTO> getReviewReplies(Long reviewId);
}
