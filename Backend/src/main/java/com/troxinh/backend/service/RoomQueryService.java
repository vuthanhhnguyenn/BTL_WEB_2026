package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.dto.room.RoomSearchResponse;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.repository.RoomRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

@Service
public class RoomQueryService {
    private final RoomRepository roomRepository;
    private final RoomResponseMapper roomResponseMapper;

    public RoomQueryService(
        RoomRepository roomRepository,
        RoomResponseMapper roomResponseMapper
    ) {
        this.roomRepository = roomRepository;
        this.roomResponseMapper = roomResponseMapper;
    }

    public List<Long> getFirst12RoomIds() {
        return roomRepository.findTop12ByOrderByIdAsc().stream().map(Room::getId).toList();
    }

    public RoomSearchResponse getRoomsByUserId(Long userId) {
        List<Room> rooms = roomRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<RoomDetailResponse> items = rooms.stream()
            .map(room -> roomResponseMapper.toRoomDetailResponse(room, userId))
            .toList();
        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse getAllRoomsForAdmin(Long currentUserId) {
        List<Room> rooms = roomRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("PENDING");
        List<RoomDetailResponse> items = rooms.stream()
            .map(room -> roomResponseMapper.toRoomDetailResponse(room, currentUserId))
            .toList();
        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse getInitialRooms(int limit, Long currentUserId) {
        int safeLimit = limit > 0 ? limit : 5;
        List<Room> rooms = roomRepository.findPublicRooms(PageRequest.of(0, safeLimit));
        List<RoomDetailResponse> items = rooms.stream()
            .map(room -> roomResponseMapper.toRoomDetailResponse(room, currentUserId))
            .toList();
        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse searchRooms(String keyword, String district, Long minPrice, Long maxPrice, Long currentUserId) {
        String k = normalize(keyword);
        String d = normalize(district);

        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            long tmp = minPrice;
            minPrice = maxPrice;
            maxPrice = tmp;
        }

        List<Room> rooms = roomRepository.searchRooms(k, d, minPrice, maxPrice);

        List<RoomDetailResponse> items = rooms.stream()
            .map(room -> roomResponseMapper.toRoomDetailResponse(room, currentUserId))
            .toList();

        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse getHighlights(int limit, Long currentUserId) {
        int safeLimit = limit > 0 ? limit : 12;
        List<RoomDetailResponse> items = roomRepository.findHighlights(PageRequest.of(0, safeLimit))
            .stream()
            .map(room -> roomResponseMapper.toRoomDetailResponse(room, currentUserId))
            .toList();
        return new RoomSearchResponse(items, items.size());
    }

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
