package com.troxinh.backend.dto.room;

import java.math.BigDecimal;
import java.util.List;

public record RoomDetailResponse(
    Long id,
    String title,
    String address,
    String district,
    String city,
    String mapAddress,
    Long priceFrom,
    Long priceTo,
    BigDecimal area,
    String direction,
    Integer bedrooms,
    Integer bathrooms,
    String description,
    List<String> images,
    RoomContactResponse contact
) {
}