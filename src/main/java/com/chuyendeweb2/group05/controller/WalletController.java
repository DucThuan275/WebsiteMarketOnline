package com.chuyendeweb2.group05.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.chuyendeweb2.group05.dto.WalletDTO;
import com.chuyendeweb2.group05.dto.WalletInfoDTO;
import com.chuyendeweb2.group05.dto.WithdrawRequestDTO;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.entity.meta.Wallet;
import com.chuyendeweb2.group05.repo.WalletRepository;
import com.chuyendeweb2.group05.service.WalletService;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet API", description = "Endpoints for managing user wallets")
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletRepository walletRepository;
    private final WalletService walletService;

    // Endpoint để lấy tất cả các ví và tên người dùng
    // Endpoint để lấy tất cả các ví và thông tin người dùng
    @GetMapping("/list")
    public ResponseEntity<List<WalletInfoDTO>> getAllWalletsWithUserInfo() {
        // Lấy danh sách thông tin ví từ service
        List<WalletInfoDTO> walletInfo = walletService.getAllWalletsWithUserInfo();

        // Trả về danh sách dưới dạng ResponseEntity
        return ResponseEntity.ok(walletInfo);
    }

    @GetMapping
    @Operation(summary = "Get current user's wallet information")
    public ResponseEntity<WalletDTO> getWallet(@AuthenticationPrincipal User user) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> {
                    // Create a new wallet if user doesn't have one
                    Wallet newWallet = user.createWallet();
                    return walletRepository.save(newWallet);
                });

        return ResponseEntity.ok(mapToDTO(wallet));
    }

    // Endpoint để rút tiền (sử dụng @RequestBody)
    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds from user's wallet")
    public ResponseEntity<String> withdrawFunds(@AuthenticationPrincipal User user,
            @RequestBody WithdrawRequestDTO withdrawRequest) {
        try {
            // Sử dụng thông tin từ DTO để rút tiền
            walletService.withdrawFunds(user, withdrawRequest.getAmount());
            return ResponseEntity.ok("Withdrawal successful");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private WalletDTO mapToDTO(Wallet wallet) {
        return WalletDTO.builder()
                .id(wallet.getId())
                .userId(wallet.getUser().getId())
                .balance(wallet.getBalance())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
