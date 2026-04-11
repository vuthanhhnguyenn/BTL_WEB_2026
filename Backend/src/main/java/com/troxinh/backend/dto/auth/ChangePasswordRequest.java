package com.troxinh.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "oldPassword is required")
    String oldPassword,

    @NotBlank(message = "newPassword is required")
    @Size(min = 6, message = "newPassword must be at least 6 characters")
    String newPassword
) {
}