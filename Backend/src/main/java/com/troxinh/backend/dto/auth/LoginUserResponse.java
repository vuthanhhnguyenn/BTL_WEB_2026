package com.troxinh.backend.dto.auth;

public record LoginUserResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String role,
    String avatarUrl
) {
}
