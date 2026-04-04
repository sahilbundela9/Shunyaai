package com.shunyaai.backend.dto;

public class AuthResponse {

    private String message;
    private String accessToken;
    private String refreshToken;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String message, String accessToken, String refreshToken, String role) {
        this.message = message;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
    }

    public String getMessage() { return message; }
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public String getRole() { return role; }

    public void setMessage(String message) { this.message = message; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public void setRole(String role) { this.role = role; }
}
