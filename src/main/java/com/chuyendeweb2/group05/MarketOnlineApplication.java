package com.chuyendeweb2.group05;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
@ComponentScan(basePackages = "com.chuyendeweb2.group05")
public class MarketOnlineApplication {

	public static void main(String[] args) {
		SpringApplication.run(MarketOnlineApplication.class, args);
	}

}
