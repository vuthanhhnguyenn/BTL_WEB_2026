package com.troxinh.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @NotBlank(message = "fullName is required")
    String fullName,

    @NotBlank(message = "phone is required")
    String phone,

    String avatarUrl
) {
}
