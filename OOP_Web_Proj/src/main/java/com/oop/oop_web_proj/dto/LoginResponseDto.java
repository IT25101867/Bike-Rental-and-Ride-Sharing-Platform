package com.oop.oop_web_proj.dto;

public class LoginResponseDto {
    private String message;
    private String role;

    public LoginResponseDto() {}

    public LoginResponseDto(String message, String role) {
        this.message = message;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
