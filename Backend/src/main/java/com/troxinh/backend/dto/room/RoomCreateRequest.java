package com.troxinh.backend.dto.room;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RoomCreateRequest(
    @NotBlank(message = "title is required")
    String title,

    @NotBlank(message = "address is required")
    String address,

    @NotBlank(message = "district is required")
    String district,

    @NotBlank(message = "city is required")
    String city,

    @NotBlank(message = "mapAddress is required")
    String mapAddress,

    @NotNull(message = "priceFrom is required")
    Long priceFrom,

    @NotNull(message = "priceTo is required")
    Long priceTo,

    @NotNull(message = "area is required")
    BigDecimal area,

    @NotBlank(message = "direction is required")
    String direction,

    @NotNull(message = "bedrooms is required")
    Integer bedrooms,

    @NotNull(message = "bathrooms is required")
    Integer bathrooms,

    @NotBlank(message = "description is required")
    String description,

    @NotNull(message = "contact is required")
    @Valid
    RoomContactRequest contact
) {
}
