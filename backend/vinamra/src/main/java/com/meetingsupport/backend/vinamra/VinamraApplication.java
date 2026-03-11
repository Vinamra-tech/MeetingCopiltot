package com.meetingsupport.backend.vinamra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

// 🚀 THIS IS THE MAGIC LINE THAT FIXES EVERYTHING
@SpringBootApplication(scanBasePackages = "com.meetingsupport.backend")
@EnableJpaRepositories(basePackages = "com.meetingsupport.backend")
@EntityScan(basePackages = "com.meetingsupport.backend")
public class VinamraApplication {

    public static void main(String[] args) {
        SpringApplication.run(VinamraApplication.class, args);
    }

}