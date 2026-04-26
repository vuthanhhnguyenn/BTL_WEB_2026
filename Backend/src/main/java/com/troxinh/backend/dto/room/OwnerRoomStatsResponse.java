package com.troxinh.backend.dto.room;

public record OwnerRoomStatsResponse(
    long totalRooms,
    long featuredRooms,
    long totalViews,
    long totalContactClicks,
    long totalFavorites
) {
}
