package com.troxinh.backend.dto.user;

import jakarta.validation.constraints.NotBlank;

public record SavedSearchRequest(
    @NotBlank(message = "name is required")
    String name,
    String keyword,
    String district,
    Long minPrice,
    Long maxPrice
) {
}
