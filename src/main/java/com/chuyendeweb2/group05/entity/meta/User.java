package com.chuyendeweb2.group05.entity.meta;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.chuyendeweb2.group05.enums.Gender;
import com.chuyendeweb2.group05.enums.Role;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "FirstName", nullable = false, length = 100)
    private String firstname;

    @Column(name = "LastName", nullable = false, length = 100)
    private String lastname;

    @Column(name = "Address", nullable = true, length = 100)
    private String address;

    @Column(name = "mobileNumber", nullable = true, length = 20)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "Email", nullable = false, length = 100, unique = true)
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "user")
    private List<Token> tokens;

    @Builder.Default
    private boolean twoFactorVerified = false;

    @Builder.Default
    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;

    @Column(name = "enabled")
    @Builder.Default
    private Boolean enabled = true;

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    // Add wallet relationship
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Wallet wallet;

    @OneToMany(mappedBy = "seller")
    @Builder.Default
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "approvedBy")
    @Builder.Default
    private List<Product> approvedProducts = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    public String getFullName() {
        return this.firstname + " " + this.lastname;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.enabled);
    }

    public void setCart(Cart cart) {
        this.cart = cart;
        cart.setUser(this);
    }

    public void removeCart() {
        if (cart != null) {
            cart.setUser(null);
            this.cart = null;
        }
    }

    public Cart createCart() {
        Cart newCart = Cart.builder()
                .user(this)
                .totalAmount(new java.math.BigDecimal(0))
                .build();
        this.cart = newCart;
        return newCart;
    }

    // Method to create a wallet for the user
    public Wallet createWallet() {
        Wallet newWallet = Wallet.builder()
                .user(this)
                .balance(new java.math.BigDecimal(0))
                .build();
        this.wallet = newWallet;
        return newWallet;
    }

    // Method to add a product
    public void addProduct(Product product) {
        products.add(product);
        product.setSeller(this);
    }

    // Method to remove a product
    public void removeProduct(Product product) {
        products.remove(product);
        product.setSeller(null);
    }

    // Method to check if user is admin
    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    // Method for admin to approve a product
    public void approveProduct(Product product) {
        if (!this.isAdmin()) {
            throw new IllegalStateException("Only admins can approve products");
        }
        product.activate(this);
    }
}