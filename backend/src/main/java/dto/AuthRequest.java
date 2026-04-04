package com.shunyaai.backend.dto;

public class AuthRequest {

    private String name;
    private String email;
    private String password;
    private String role;

    public AuthRequest() {}

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
}
