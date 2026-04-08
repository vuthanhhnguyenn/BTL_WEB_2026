package com.troxinh.backend.dto.auth;

public record RegisterResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String role,
    Boolean isActive,
    String message
) {
}

