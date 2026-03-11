package com.meetingsupport.backend.vinamra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 🚀 THIS IS THE MAGIC LINE THAT FIXES EVERYTHING
@SpringBootApplication(scanBasePackages = "com.meetingsupport.backend")
public class VinamraApplication {

    public static void main(String[] args) {
        SpringApplication.run(VinamraApplication.class, args);
    }

}