package com.troxinh.backend.dto.user;

public record UserResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String role,
    String avatarUrl,
    Boolean isActive
) {
}
