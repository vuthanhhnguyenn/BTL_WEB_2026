package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.RoomContactResponse;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.dto.room.RoomSearchResponse;
import com.troxinh.backend.entity.RoomContact;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.entity.RoomImage;
import com.troxinh.backend.repository.RoomContactRepository;
import com.troxinh.backend.repository.RoomImageRepository;
import com.troxinh.backend.repository.RoomRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
public class RoomQueryService {
    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomContactRepository roomContactRepository;

    public RoomQueryService(
        RoomRepository roomRepository,
        RoomImageRepository roomImageRepository,
        RoomContactRepository roomContactRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomImageRepository = roomImageRepository;
        this.roomContactRepository = roomContactRepository;
    }

    public List<Long> getFirst12RoomIds() {
        return roomRepository.findTop12ByOrderByIdAsc().stream().map(Room::getId).toList();
    }

    public RoomSearchResponse getRoomsByUserId(Long userId) {
        List<Room> rooms = roomRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<RoomDetailResponse> items = rooms.stream().map(this::toRoomDetailResponse).toList();
        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse getAllRoomsForAdmin() {
        List<Room> rooms = roomRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("PENDING");
        List<RoomDetailResponse> items = rooms.stream().map(this::toRoomDetailResponse).toList();
        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse getInitialRooms(int limit) {
        int safeLimit = limit > 0 ? limit : 5;
        List<Room> rooms = roomRepository
            .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.ASC, "id")))
            .getContent();
        List<RoomDetailResponse> items = rooms.stream().map(this::toRoomDetailResponse).toList();
        return new RoomSearchResponse(items, items.size());
    }

    public RoomSearchResponse searchRooms(String keyword, String district, Long minPrice, Long maxPrice) {
        String k = normalize(keyword);
        String d = normalize(district);

        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            long tmp = minPrice;
            minPrice = maxPrice;
            maxPrice = tmp;
        }

        List<Room> rooms = roomRepository.searchRooms(k, d, minPrice, maxPrice);

        List<RoomDetailResponse> items = rooms.stream().map(this::toRoomDetailResponse).toList();

        return new RoomSearchResponse(items, items.size());
    }

    private RoomDetailResponse toRoomDetailResponse(Room room) {
        List<String> images = roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(room.getId())
            .stream()
            .map(RoomImage::getImageUrl)
            .filter(url -> url != null && !url.isBlank())
            .toList();

        if (images.isEmpty()) {
            images = List.of("https://png.pngtree.com/png-vector/20220820/ourmid/pngtree-no-results-found-neon-light-icon-graphic-site-illuminated-vector-png-image_33356826.jpg");
        }

        RoomContactResponse contact = roomContactRepository.findByRoomId(room.getId())
            .map(this::toContactResponse)
            .orElseGet(() -> new RoomContactResponse("Not in DB", "Not in DB", "Not in DB"));

        return new RoomDetailResponse(
            room.getId(),
            safe(room.getTitle()),
            safe(room.getAddress()),
            safe(room.getDistrict()),
            safe(room.getCity()),
            safe(room.getMapAddress()),
            room.getPriceFrom() == null ? 0L : room.getPriceFrom(),
            room.getPriceTo() == null ? 0L : room.getPriceTo(),
            room.getArea() == null ? BigDecimal.ZERO : room.getArea(),
            safe(room.getDirection()),
            room.getBedrooms() == null ? 0 : room.getBedrooms(),
            room.getBathrooms() == null ? 0 : room.getBathrooms(),
            safe(room.getDescription()),
            safe(room.getStatus()),
            images,
            contact
        );
    }

    private RoomContactResponse toContactResponse(RoomContact contact) {
        return new RoomContactResponse(
            safe(contact.getContactName()),
            safe(contact.getContactPhone()),
            safe(contact.getContactEmail())
        );
    }

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private String safe(String s) {
        return (s == null || s.isBlank()) ? "Not in DB" : s;
    }
}
