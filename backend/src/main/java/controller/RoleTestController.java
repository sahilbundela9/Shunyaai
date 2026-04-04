package com.shunyaai.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RoleTestController {

    @GetMapping("/admin/test")
    public String adminOnly() {
        return "Admin Access Granted";
    }

    @GetMapping("/user/test")
    public String userAccess() {
        return "User Access Granted";
    }

    @GetMapping("/ping")
    public String ping() {
        return "Controller working";
    }

}
