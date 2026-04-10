package com.troxinh.backend.dto.room;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RoomContactRequest(
    @NotBlank(message = "contact.name is required")
    String name,

    @NotBlank(message = "contact.phone is required")
    String phone,

    @NotBlank(message = "contact.email is required")
    @Email(message = "contact.email is invalid")
    String email
) {
}
