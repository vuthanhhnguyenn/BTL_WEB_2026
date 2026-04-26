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
    String status,
    List<String> images,
    RoomContactResponse contact,
    Boolean featured,
    Boolean favorited,
    Integer viewCount,
    Integer contactClickCount,
    Long favoriteCount,
    Long reportCount
) {
}
