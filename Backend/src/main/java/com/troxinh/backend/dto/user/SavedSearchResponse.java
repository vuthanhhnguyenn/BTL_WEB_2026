package com.troxinh.backend.dto.user;

import java.time.LocalDateTime;

public record SavedSearchResponse(
    Long id,
    String name,
    String keyword,
    String district,
    Long minPrice,
    Long maxPrice,
    LocalDateTime createdAt
) {
}
