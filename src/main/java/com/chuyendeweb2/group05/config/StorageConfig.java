package com.chuyendeweb2.group05.config;

import com.chuyendeweb2.group05.service.ProductImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Bean
    CommandLineRunner initStorageDirectories(
            @Autowired ProductImageStorageService productImageStorageService) {
        return args -> {
            productImageStorageService.init();
        };
    }
}