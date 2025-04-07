package com.chuyendeweb2.group05.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.entity.meta.Wallet;
import com.chuyendeweb2.group05.entity.meta.WithdrawalTransaction;
import com.chuyendeweb2.group05.repo.WalletRepository;
import com.chuyendeweb2.group05.repo.WithdrawalTransactionRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    private final WalletRepository walletRepository;
    private final WithdrawalTransactionRepository withdrawalTransactionRepository;

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    public VNPayService(WalletRepository walletRepository,
            WithdrawalTransactionRepository withdrawalTransactionRepository) {
        this.walletRepository = walletRepository;
        this.withdrawalTransactionRepository = withdrawalTransactionRepository;
    }

    @Transactional
    public String createWithdrawalRequest(User user, BigDecimal amount, String bankCode) {
        // Kiểm tra ví của người dùng
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("User does not have a wallet"));

        // Kiểm tra số dư
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }

        // Tạm thời reserved số tiền (tạo transaction với trạng thái pending)
        WithdrawalTransaction transaction = WithdrawalTransaction.builder()
                .user(user)
                .amount(amount)
                .status("PENDING")
                .transactionCode(generateTransactionCode())
                .build();

        withdrawalTransactionRepository.save(transaction);

        // Tạo URL thanh toán
        return createPaymentUrl(transaction, amount, bankCode);
    }

    private String createPaymentUrl(WithdrawalTransaction transaction, BigDecimal amount, String bankCode) {
        Map<String, String> vnpParams = new HashMap<>();

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());

        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", amount.multiply(new BigDecimal("100")).intValue() + "");
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_BankCode", bankCode);
        vnpParams.put("vnp_TxnRef", transaction.getTransactionCode());
        vnpParams.put("vnp_OrderInfo", "Withdraw from wallet - " + transaction.getTransactionCode());
        vnpParams.put("vnp_OrderType", "250000"); // Withdrawal type
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        // Sắp xếp các tham số theo thứ tự a-z
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Build hash data
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnpSecureHash);

        return vnpUrl + "?" + query;
    }

    @Transactional
    public void processWithdrawalCallback(String vnpTxnRef, String vnpResponseCode, String vnpSecureHash) {
        // Kiểm tra mã giao dịch
        WithdrawalTransaction transaction = withdrawalTransactionRepository.findByTransactionCode(vnpTxnRef)
                .orElseThrow(() -> new IllegalStateException("Transaction not found"));

        // Kiểm tra chữ ký vnpSecureHash (bạn cần implement việc kiểm tra này)
        if (!validateSecureHash(vnpSecureHash)) {
            throw new IllegalStateException("Invalid secure hash");
        }

        // Xử lý kết quả
        if ("00".equals(vnpResponseCode)) {
            // Giao dịch thành công
            // Cập nhật trạng thái giao dịch
            transaction.setStatus("COMPLETED");
            withdrawalTransactionRepository.save(transaction);

            // Trừ tiền từ ví
            Wallet wallet = walletRepository.findByUser(transaction.getUser())
                    .orElseThrow(() -> new IllegalStateException("User does not have a wallet"));
            wallet.withdrawFunds(transaction.getAmount());
            walletRepository.save(wallet);
        } else {
            // Giao dịch thất bại
            transaction.setStatus("FAILED");
            transaction.setErrorCode(vnpResponseCode);
            withdrawalTransactionRepository.save(transaction);
        }
    }

    private String generateTransactionCode() {
        return String.valueOf(System.currentTimeMillis());
    }

    private boolean validateSecureHash(String vnpSecureHash) {
        // Implement logic to validate secure hash
        // This is a placeholder - you need to implement the actual validation
        return true;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac.init(secretKeySpec);
            byte[] hmacData = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hmacData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}