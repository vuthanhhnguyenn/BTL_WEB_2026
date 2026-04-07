package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.RoomContactResponse;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.entity.RoomContact;
import com.troxinh.backend.entity.RoomImage;
import com.troxinh.backend.repository.RoomContactRepository;
import com.troxinh.backend.repository.RoomImageRepository;
import com.troxinh.backend.repository.RoomRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class RoomDetailService {

    private static final String NOT_IN_DB = "Not in DB";
    private static final String FALLBACK_IMAGE = "https://via.placeholder.com/1200x800.png?text=Not+in+DB";

    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomContactRepository roomContactRepository;

    public RoomDetailService(RoomRepository roomRepository, RoomImageRepository roomImageRepository, RoomContactRepository roomContactRepository) {
        this.roomRepository = roomRepository;
        this.roomImageRepository = roomImageRepository;
        this.roomContactRepository = roomContactRepository;
    }

    public RoomDetailResponse getRoomDetail(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Khong tim thay phong voi id=" + id));

        List<String> images = roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(room.getId())
            .stream()
            .map(RoomImage::getImageUrl)
            .filter(this::hasText)
            .toList();

        if (images.isEmpty()) {
            images = List.of(FALLBACK_IMAGE);
        }

        RoomContactResponse contact = mapContact(roomContactRepository.findByRoomId(room.getId()));

        return new RoomDetailResponse(
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
            images,
            contact
        );
    }

    private RoomContactResponse mapContact(Optional<RoomContact> contactOptional) {
        if (contactOptional.isPresent()) {
            RoomContact c = contactOptional.get();
            return new RoomContactResponse(
                orNotInDb(c.getContactName()),
                orNotInDb(c.getContactPhone()),
                orNotInDb(c.getContactEmail())
            );
        }

        return new RoomContactResponse(NOT_IN_DB, NOT_IN_DB, NOT_IN_DB);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String orNotInDb(String value) {
        return hasText(value) ? value : NOT_IN_DB;
    }

    
}