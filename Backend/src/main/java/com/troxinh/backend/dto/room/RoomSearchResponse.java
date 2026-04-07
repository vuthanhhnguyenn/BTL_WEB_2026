package com.troxinh.backend.dto.room;

import java.util.List;

public record RoomSearchResponse(
    List<RoomDetailResponse> content,
    long totalElements
) {}