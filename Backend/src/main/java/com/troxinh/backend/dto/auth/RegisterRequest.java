package com.troxinh.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "fullName is required")
    String fullName,

    @NotBlank(message = "email is required")
    @Email(message = "email is invalid")
    String email,

    @NotBlank(message = "phone is required")
    String phone,

    @NotBlank(message = "password is required")
    @Size(min = 6, max = 255, message = "password must be at least 6 characters")
    String password,

    String confirmPassword,
    String role
) {
}

