package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.RoomContactRequest;
import com.troxinh.backend.dto.room.RoomContactResponse;
import com.troxinh.backend.dto.room.RoomCreateRequest;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.dto.room.RoomUpdateRequest;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.entity.RoomContact;
import com.troxinh.backend.entity.RoomImage;
import com.troxinh.backend.entity.User;
import com.troxinh.backend.repository.RoomContactRepository;
import com.troxinh.backend.repository.RoomImageRepository;
import com.troxinh.backend.repository.RoomRepository;
import com.troxinh.backend.repository.UserRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RoomWriteService {

    private static final String DEFAULT_STATUS = "AVAILABLE";
    private static final String FALLBACK_IMAGE = "https://placehold.co/1200x800?text=No+Image";

    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomContactRepository roomContactRepository;
    private final UserRepository userRepository;

    public RoomWriteService(
        RoomRepository roomRepository,
        RoomImageRepository roomImageRepository,
        RoomContactRepository roomContactRepository,
        UserRepository userRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomImageRepository = roomImageRepository;
        this.roomContactRepository = roomContactRepository;
        this.userRepository = userRepository;
    }

    public RoomDetailResponse createRoom(RoomCreateRequest request, List<MultipartFile> images, String authorizationHeader) {
        if (request.priceFrom() > request.priceTo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceFrom must not be greater than priceTo");
        }

        User owner = resolveOwner(authorizationHeader);

        Room room = new Room();
        room.setUser(owner);
        room.setTitle(normalize(request.title()));
        room.setAddress(normalize(request.address()));
        room.setDistrict(normalize(request.district()));
        room.setCity(normalize(request.city()));
        room.setMapAddress(normalize(request.mapAddress()));
        room.setPriceFrom(request.priceFrom());
        room.setPriceTo(request.priceTo());
        room.setArea(request.area());
        room.setDirection(normalize(request.direction()));
        room.setBedrooms(request.bedrooms());
        room.setBathrooms(request.bathrooms());
        room.setDescription(normalize(request.description()));
        room.setStatus(DEFAULT_STATUS);
        room.setViewCount(0);
        room.setIsFeatured(false);

        Room savedRoom = roomRepository.save(room);

        List<String> imageUrls = saveImages(savedRoom, images);
        RoomContactResponse contact = saveContact(savedRoom, request.contact());

        return new RoomDetailResponse(
            savedRoom.getId(),
            savedRoom.getTitle(),
            savedRoom.getAddress(),
            savedRoom.getDistrict(),
            savedRoom.getCity(),
            savedRoom.getMapAddress(),
            savedRoom.getPriceFrom(),
            savedRoom.getPriceTo(),
            savedRoom.getArea(),
            savedRoom.getDirection(),
            savedRoom.getBedrooms(),
            savedRoom.getBathrooms(),
            savedRoom.getDescription(),
            imageUrls,
            contact
        );
    }

    private User resolveOwner(String authorizationHeader) {
        Long userId = extractUserId(authorizationHeader);
        if (userId != null) {
            return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found for provided token"));
        }

        return userRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No user available. Please register before posting a room."));
    }

    private Long extractUserId(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }

        String prefix = "Bearer troxinh-token-";
        if (!authorizationHeader.startsWith(prefix)) {
            return null;
        }

        try {
            return Long.parseLong(authorizationHeader.substring(prefix.length()).trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }

    private List<String> saveImages(Room room, List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();
        List<MultipartFile> safeImages = images == null ? List.of() : images;

        int sortOrder = 0;
        for (MultipartFile image : safeImages) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            RoomImage roomImage = new RoomImage();
            roomImage.setRoom(room);
            roomImage.setSortOrder(sortOrder++);
            roomImage.setImageUrl(toPlaceholderImageUrl(image.getOriginalFilename()));
            roomImageRepository.save(roomImage);
            imageUrls.add(roomImage.getImageUrl());
        }

        if (imageUrls.isEmpty()) {
            RoomImage fallback = new RoomImage();
            fallback.setRoom(room);
            fallback.setSortOrder(0);
            fallback.setImageUrl(FALLBACK_IMAGE);
            roomImageRepository.save(fallback);
            imageUrls.add(FALLBACK_IMAGE);
        }

        return imageUrls;
    }

    private RoomContactResponse saveContact(Room room, RoomContactRequest request) {
        RoomContact contact = new RoomContact();
        contact.setRoom(room);
        contact.setContactName(normalize(request.name()));
        contact.setContactPhone(normalize(request.phone()));
        contact.setContactEmail(normalize(request.email()));
        RoomContact savedContact = roomContactRepository.save(contact);

        return new RoomContactResponse(
            savedContact.getContactName(),
            savedContact.getContactPhone(),
            savedContact.getContactEmail()
        );
    }

    public RoomDetailResponse updateRoom(Long roomId, RoomUpdateRequest request, Long userId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (!room.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own rooms");
        }

        if (request.priceFrom() > request.priceTo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceFrom must not be greater than priceTo");
        }

        room.setTitle(normalize(request.title()));
        room.setAddress(normalize(request.address()));
        room.setDistrict(normalize(request.district()));
        room.setCity(normalize(request.city()));
        room.setMapAddress(normalize(request.mapAddress()));
        room.setPriceFrom(request.priceFrom());
        room.setPriceTo(request.priceTo());
        room.setArea(request.area());
        room.setDirection(normalize(request.direction()));
        room.setBedrooms(request.bedrooms());
        room.setBathrooms(request.bathrooms());
        room.setDescription(normalize(request.description()));
        if (request.status() != null && !request.status().isBlank()) {
            room.setStatus(request.status());
        }

        Room savedRoom = roomRepository.save(room);

        RoomContactResponse contact = updateContact(savedRoom, request.contact());

        List<String> images = roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(roomId)
            .stream()
            .map(RoomImage::getImageUrl)
            .filter(url -> url != null && !url.isBlank())
            .toList();

        if (images.isEmpty()) {
            images = List.of(FALLBACK_IMAGE);
        }

        return new RoomDetailResponse(
            savedRoom.getId(),
            savedRoom.getTitle(),
            savedRoom.getAddress(),
            savedRoom.getDistrict(),
            savedRoom.getCity(),
            savedRoom.getMapAddress(),
            savedRoom.getPriceFrom(),
            savedRoom.getPriceTo(),
            savedRoom.getArea(),
            savedRoom.getDirection(),
            savedRoom.getBedrooms(),
            savedRoom.getBathrooms(),
            savedRoom.getDescription(),
            images,
            contact
        );
    }

    private RoomContactResponse updateContact(Room room, RoomContactRequest request) {
        RoomContact contact = roomContactRepository.findByRoomId(room.getId())
            .orElseGet(() -> {
                RoomContact newContact = new RoomContact();
                newContact.setRoom(room);
                return newContact;
            });

        contact.setContactName(normalize(request.name()));
        contact.setContactPhone(normalize(request.phone()));
        contact.setContactEmail(normalize(request.email()));
        RoomContact savedContact = roomContactRepository.save(contact);

        return new RoomContactResponse(
            savedContact.getContactName(),
            savedContact.getContactPhone(),
            savedContact.getContactEmail()
        );
    }

    public void deleteRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (!room.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own rooms");
        }

        roomImageRepository.deleteAll(roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(roomId));
        roomContactRepository.deleteAll(roomContactRepository.findAll().stream()
            .filter(c -> c.getRoom().getId().equals(roomId))
            .toList());
        roomContactRepository.deleteAll(roomContactRepository.findByRoomId(roomId).stream().toList());

        roomRepository.delete(room);
    }

    public Long getUserIdFromToken(String authorizationHeader) {
        return extractUserId(authorizationHeader);
    }

    private String toPlaceholderImageUrl(String originalFilename) {
        String label = normalize(originalFilename);
        if (label.isBlank()) {
            label = "Room+Image";
        } else {
            label = URLEncoder.encode(label, StandardCharsets.UTF_8);
        }
        return "https://placehold.co/1200x800?text=" + label;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
