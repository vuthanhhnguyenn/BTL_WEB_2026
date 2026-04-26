package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.RoomContactResponse;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.entity.RoomContact;
import com.troxinh.backend.entity.RoomImage;
import com.troxinh.backend.repository.FavoriteRepository;
import com.troxinh.backend.repository.RoomContactRepository;
import com.troxinh.backend.repository.RoomImageRepository;
import com.troxinh.backend.repository.RoomReportRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RoomResponseMapper {

    private static final String NOT_IN_DB = "Not in DB";
    private static final String FALLBACK_IMAGE = "https://via.placeholder.com/1200x800.png?text=Not+in+DB";

    private final RoomImageRepository roomImageRepository;
    private final RoomContactRepository roomContactRepository;
    private final FavoriteRepository favoriteRepository;
    private final RoomReportRepository roomReportRepository;

    public RoomResponseMapper(
        RoomImageRepository roomImageRepository,
        RoomContactRepository roomContactRepository,
        FavoriteRepository favoriteRepository,
        RoomReportRepository roomReportRepository
    ) {
        this.roomImageRepository = roomImageRepository;
        this.roomContactRepository = roomContactRepository;
        this.favoriteRepository = favoriteRepository;
        this.roomReportRepository = roomReportRepository;
    }

    public RoomDetailResponse toRoomDetailResponse(Room room, Long currentUserId) {
        return toRoomDetailResponses(List.of(room), currentUserId).get(0);
    }

    public List<RoomDetailResponse> toRoomDetailResponses(List<Room> rooms, Long currentUserId) {
        if (rooms.isEmpty()) {
            return List.of();
        }

        List<Long> roomIds = rooms.stream()
            .map(Room::getId)
            .toList();

        Map<Long, List<String>> imagesByRoomId = buildImagesByRoomId(roomIds);
        Map<Long, RoomContactResponse> contactsByRoomId = buildContactsByRoomId(roomIds);
        Map<Long, Long> favoriteCounts = toCountMap(favoriteRepository.countByRoomIds(roomIds));
        Map<Long, Long> reportCounts = toCountMap(roomReportRepository.countByRoomIds(roomIds));
        Set<Long> favoritedRoomIds = currentUserId == null
            ? Collections.emptySet()
            : favoriteRepository.findFavoritedRoomIds(currentUserId, roomIds);

        return rooms.stream()
            .map(room -> new RoomDetailResponse(
                room.getId(),
                orNotInDb(room.getTitle()),
                orNotInDb(room.getAddress()),
                orNotInDb(room.getDistrict()),
                orNotInDb(room.getCity()),
                orNotInDb(room.getMapAddress()),
                room.getPriceFrom() == null ? 0L : room.getPriceFrom(),
                room.getPriceTo() == null ? 0L : room.getPriceTo(),
                room.getArea() == null ? BigDecimal.ZERO : room.getArea(),
                orNotInDb(room.getDirection()),
                room.getBedrooms() == null ? 0 : room.getBedrooms(),
                room.getBathrooms() == null ? 0 : room.getBathrooms(),
                orNotInDb(room.getDescription()),
                orNotInDb(room.getStatus()),
                imagesByRoomId.getOrDefault(room.getId(), List.of(FALLBACK_IMAGE)),
                contactsByRoomId.getOrDefault(room.getId(), emptyContact()),
                Boolean.TRUE.equals(room.getIsFeatured()),
                favoritedRoomIds.contains(room.getId()),
                room.getViewCount() == null ? 0 : room.getViewCount(),
                room.getContactClickCount() == null ? 0 : room.getContactClickCount(),
                favoriteCounts.getOrDefault(room.getId(), 0L),
                reportCounts.getOrDefault(room.getId(), 0L)
            ))
            .toList();
    }

    private Map<Long, List<String>> buildImagesByRoomId(List<Long> roomIds) {
        Map<Long, List<String>> imagesByRoomId = new HashMap<>();

        for (RoomImage image : roomImageRepository.findAllByRoomIdsOrderByRoomIdAscSortOrderAscIdAsc(roomIds)) {
            if (!hasText(image.getImageUrl())) {
                continue;
            }

            imagesByRoomId.computeIfAbsent(image.getRoom().getId(), key -> new ArrayList<>())
                .add(image.getImageUrl());
        }

        return imagesByRoomId;
    }

    private Map<Long, RoomContactResponse> buildContactsByRoomId(List<Long> roomIds) {
        Map<Long, RoomContactResponse> contactsByRoomId = new HashMap<>();

        for (RoomContact contact : roomContactRepository.findAllByRoomIds(roomIds)) {
            contactsByRoomId.put(contact.getRoom().getId(), mapContact(contact));
        }

        return contactsByRoomId;
    }

    private Map<Long, Long> toCountMap(List<Object[]> rows) {
        Map<Long, Long> counts = new HashMap<>();

        for (Object[] row : rows) {
            counts.put((Long) row[0], (Long) row[1]);
        }

        return counts;
    }

    private RoomContactResponse mapContact(Optional<RoomContact> contactOptional) {
        return contactOptional.map(this::mapContact).orElseGet(this::emptyContact);
    }

    private RoomContactResponse mapContact(RoomContact contact) {
        return new RoomContactResponse(
            orNotInDb(contact.getContactName()),
            orNotInDb(contact.getContactPhone()),
            orNotInDb(contact.getContactEmail())
        );
    }

    private RoomContactResponse emptyContact() {
        return new RoomContactResponse(NOT_IN_DB, NOT_IN_DB, NOT_IN_DB);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String orNotInDb(String value) {
        return hasText(value) ? value : NOT_IN_DB;
    }
}
