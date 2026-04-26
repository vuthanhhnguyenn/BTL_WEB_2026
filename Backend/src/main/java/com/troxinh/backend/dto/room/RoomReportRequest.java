package com.troxinh.backend.dto.room;

import jakarta.validation.constraints.NotBlank;

public record RoomReportRequest(
    @NotBlank(message = "reason is required")
    String reason,
    String detail
) {
}
