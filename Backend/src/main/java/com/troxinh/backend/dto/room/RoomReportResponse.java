package com.troxinh.backend.dto.room;

import java.time.LocalDateTime;

public record RoomReportResponse(
    Long id,
    Long roomId,
    String roomTitle,
    Long reporterId,
    String reporterName,
    String reason,
    String detail,
    String status,
    LocalDateTime createdAt
) {
}
