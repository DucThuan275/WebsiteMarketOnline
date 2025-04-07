package com.chuyendeweb2.group05.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.chuyendeweb2.group05.dto.WalletInfoDTO;
import com.chuyendeweb2.group05.entity.meta.Order;
import com.chuyendeweb2.group05.entity.meta.OrderDetail;
import com.chuyendeweb2.group05.entity.meta.Product;
import com.chuyendeweb2.group05.entity.meta.User;
import com.chuyendeweb2.group05.entity.meta.Wallet;
import com.chuyendeweb2.group05.entity.meta.WebsiteRevenue;
import com.chuyendeweb2.group05.repo.WalletRepository;
import com.chuyendeweb2.group05.repo.WebsiteRevenueRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WebsiteRevenueRepository websiteRevenueRepository;

    // Phương thức rút tiền
    @Transactional
    public void withdrawFunds(User user, BigDecimal amount) {
        // Tìm ví người dùng
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Wallet not found for user"));

        // Kiểm tra số tiền yêu cầu rút
        wallet.withdrawFunds(amount); // Sử dụng phương thức withdrawFunds đã có trong entity Wallet

        // Lưu lại thay đổi ví
        walletRepository.save(wallet);
    }

    // Phương thức lấy tất cả ví và thông tin chủ ví
    public List<WalletInfoDTO> getAllWalletsWithUserInfo() {
        // Lấy tất cả ví
        List<Wallet> wallets = walletRepository.findAll();

        // Trả về danh sách các đối tượng WalletInfoDTO
        return wallets.stream()
                .map(wallet -> new WalletInfoDTO(
                        wallet.getUser().getFullName(), // Tên người dùng
                        wallet.getBalance(), // Số dư ví
                        wallet.getUser().getEmail() // Email người dùng (thêm theo yêu cầu)
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void processOrderPayment(Order order) {
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            Product product = orderDetail.getProduct();
            User seller = product.getSeller(); // Người bán từ sản phẩm

            // Tính số tiền cần cộng vào ví người bán
            BigDecimal totalAmount = orderDetail.getPrice().multiply(BigDecimal.valueOf(orderDetail.getQuantity()));

            // Tính toán 75% cho người bán và 25% cho website
            BigDecimal sellerAmount = totalAmount.multiply(BigDecimal.valueOf(0.75)); // 75% cho người bán
            BigDecimal websiteAmount = totalAmount.multiply(BigDecimal.valueOf(0.25)); // 25% cho website

            // Tìm ví người bán và cộng tiền
            Wallet sellerWallet = walletRepository.findByUser(seller)
                    .orElseGet(() -> {
                        Wallet newWallet = new Wallet();
                        newWallet.setUser(seller);
                        newWallet.setBalance(BigDecimal.ZERO);
                        return walletRepository.save(newWallet);
                    });

            // Cộng tiền vào ví người bán
            sellerWallet.addFunds(sellerAmount);
            walletRepository.save(sellerWallet);

            // Lưu thông tin doanh thu của website vào bảng website_revenue
            WebsiteRevenue websiteRevenue = WebsiteRevenue.builder()
                    .amount(websiteAmount)
                    .order(order)
                    .product(product)
                    .seller(seller)
                    .description("Website profit for order " + order.getId())
                    .build();
            websiteRevenueRepository.save(websiteRevenue);
        }
    }
}
