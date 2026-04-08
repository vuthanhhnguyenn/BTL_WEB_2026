package com.troxinh.backend.dto.auth;

public record LoginResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String role,
    String avatarUrl,
    String message
) {
}

