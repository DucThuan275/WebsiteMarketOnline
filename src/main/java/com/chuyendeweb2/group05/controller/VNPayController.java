package com.chuyendeweb2.group05.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import com.chuyendeweb2.group05.dto.WithdrawalRequest;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.repo.UserRepository;
import com.chuyendeweb2.group05.service.VNPayService;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    private final VNPayService vnPayService;
    private final UserRepository userRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, String>> createWithdrawalRequest(
            Authentication authentication,
            @RequestBody WithdrawalRequest request) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String paymentUrl = vnPayService.createWithdrawalRequest(
                user,
                request.getAmount(),
                request.getBankCode());

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/callback")
    public void processWithdrawalCallback(
            @RequestParam("vnp_TxnRef") String vnpTxnRef,
            @RequestParam("vnp_ResponseCode") String vnpResponseCode,
            @RequestParam("vnp_SecureHash") String vnpSecureHash,
            HttpServletResponse response) throws IOException {

        // Xử lý callback từ VNPay
        vnPayService.processWithdrawalCallback(vnpTxnRef, vnpResponseCode, vnpSecureHash);

        // Tạo URL chuyển hướng đến trang xác nhận đơn hàng
        String redirectUrl = frontendUrl + "/trang-chu/gio-hang/thanh-toan/xac-nhan-don-hang/" + vnpTxnRef;

        // Thêm thông tin trạng thái thanh toán vào URL
        redirectUrl += "?vnp_ResponseCode=" + vnpResponseCode + "&vnp_TxnRef=" + vnpTxnRef;

        // Chuyển hướng đến trang frontend
        response.sendRedirect(redirectUrl);
    }
}
