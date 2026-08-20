package com.securepay.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/dashboard")
    public String dashboard() {

        return "Welcome to SecurePay Dashboard";
    }
}
