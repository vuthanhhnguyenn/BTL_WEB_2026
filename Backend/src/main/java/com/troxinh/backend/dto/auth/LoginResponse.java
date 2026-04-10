package com.troxinh.backend.dto.auth;

public record LoginResponse(
    String token,
    LoginUserResponse user,
    String message
) {
}

