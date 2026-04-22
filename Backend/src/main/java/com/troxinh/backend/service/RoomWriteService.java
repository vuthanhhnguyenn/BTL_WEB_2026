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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RoomWriteService {

    private static final String DEFAULT_STATUS = "PENDING";
    private static final String FALLBACK_IMAGE = "https://placehold.co/1200x800?text=No+Image";
    private final Path uploadRoot;

    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomContactRepository roomContactRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public RoomWriteService(
        RoomRepository roomRepository,
        RoomImageRepository roomImageRepository,
        RoomContactRepository roomContactRepository,
        UserRepository userRepository,
        JwtService jwtService,
        org.springframework.core.env.Environment environment
    ) {
        this.roomRepository = roomRepository;
        this.roomImageRepository = roomImageRepository;
        this.roomContactRepository = roomContactRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.uploadRoot = resolveUploadRoot(environment);
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

        saveImages(savedRoom, images);
        saveContact(savedRoom, request.contact());

        return buildDetailResponse(savedRoom.getId());
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
        try {
            if (authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                if (jwtService.validateToken(token)) {
                    return jwtService.getUserIdFromToken(token);
                }
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private List<String> saveImages(Room room, List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();
        List<MultipartFile> safeImages = images == null ? List.of() : images;

        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create upload directory", e);
        }

        int sortOrder = 0;
        for (MultipartFile image : safeImages) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            RoomImage roomImage = new RoomImage();
            roomImage.setRoom(room);
            roomImage.setSortOrder(sortOrder++);
            roomImage.setImageUrl(storeFileAndBuildUrl(image));
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

    public RoomDetailResponse updateRoom(Long roomId, RoomUpdateRequest request, List<MultipartFile> images, Long userId, String authorizationHeader) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        boolean isAdmin = isAdmin(authorizationHeader);
        if (!isAdmin && (userId == null || !room.getUser().getId().equals(userId))) {
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

        updateContact(savedRoom, request.contact());

        if (images != null && !images.isEmpty()) {
            deleteRoomFiles(roomId);
            roomImageRepository.deleteAll(roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(roomId));
            saveImages(savedRoom, images);
        }

        return buildDetailResponse(savedRoom.getId());
    }

    private RoomDetailResponse buildDetailResponse(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        List<String> images = roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(roomId)
            .stream()
            .map(RoomImage::getImageUrl)
            .filter(url -> url != null && !url.isBlank())
            .toList();

        if (images.isEmpty()) {
            images = List.of(FALLBACK_IMAGE);
        }

        RoomContactResponse contact = roomContactRepository.findByRoomId(roomId)
            .map(c -> new RoomContactResponse(c.getContactName(), c.getContactPhone(), c.getContactEmail()))
            .orElseGet(() -> new RoomContactResponse("", "", ""));

        return new RoomDetailResponse(
            room.getId(),
            room.getTitle(),
            room.getAddress(),
            room.getDistrict(),
            room.getCity(),
            room.getMapAddress(),
            room.getPriceFrom(),
            room.getPriceTo(),
            room.getArea(),
            room.getDirection(),
            room.getBedrooms(),
            room.getBathrooms(),
            room.getDescription(),
            room.getStatus(),
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

    public void deleteRoom(Long roomId, Long userId, String authorizationHeader) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        boolean isAdmin = isAdmin(authorizationHeader);
        if (!isAdmin && (userId == null || !room.getUser().getId().equals(userId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own rooms");
        }

        roomImageRepository.deleteAll(roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(roomId));
        deleteRoomFiles(roomId);
        roomContactRepository.deleteAll(roomContactRepository.findAll().stream()
            .filter(c -> c.getRoom().getId().equals(roomId))
            .toList());
        roomContactRepository.deleteAll(roomContactRepository.findByRoomId(roomId).stream().toList());

        roomRepository.delete(room);
    }

    public Long getUserIdFromToken(String authorizationHeader) {
        return extractUserId(authorizationHeader);
    }

    public String getRoleFromToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        try {
            if (authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                if (jwtService.validateToken(token)) {
                    return jwtService.parseToken(token).get("role", String.class);
                }
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    public boolean isAdmin(String authorizationHeader) {
        String role = getRoleFromToken(authorizationHeader);
        return role != null && role.equalsIgnoreCase("ADMIN");
    }

    private String storeFileAndBuildUrl(MultipartFile image) {
        String originalFilename = normalize(image.getOriginalFilename());
        String extension = getExtension(originalFilename);
        if (extension.isBlank()) {
            String contentType = image.getContentType();
            extension = guessExtension(contentType);
        }
        if (extension.isBlank()) {
            extension = ".jpg";
        }

        String fileName = UUID.randomUUID() + extension;
        Path target = uploadRoot.resolve(fileName).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
        }

        try {
            Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save uploaded image", e);
        }

        return "/uploads/" + fileName;
    }

    private void deleteRoomFiles(Long roomId) {
        roomImageRepository.findByRoomIdOrderBySortOrderAscIdAsc(roomId).forEach(roomImage -> {
            String imageUrl = roomImage.getImageUrl();
            if (imageUrl == null || imageUrl.isBlank() || imageUrl.startsWith("http")) {
                return;
            }
            if (imageUrl.startsWith("/uploads/")) {
                Path filePath = uploadRoot.resolve(imageUrl.substring("/uploads/".length())).normalize();
                if (filePath.startsWith(uploadRoot)) {
                    try {
                        Files.deleteIfExists(filePath);
                    } catch (IOException ignored) {
                        // Best-effort cleanup.
                    }
                }
            }
        });
    }

    private String getExtension(String filename) {
        if (filename == null || filename.isBlank()) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }

    private String guessExtension(String contentType) {
        if (contentType == null) return "";
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private Path resolveUploadRoot(org.springframework.core.env.Environment environment) {
        String configured = environment.getProperty("app.upload-dir", "uploads");
        Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();

        Path candidate = cwd.resolve(configured).normalize();
        if (Files.exists(cwd.resolve("Backend"))) {
            candidate = cwd.resolve("Backend").resolve(configured).normalize();
        } else if (!"Backend".equalsIgnoreCase(cwd.getFileName() == null ? "" : cwd.getFileName().toString())
            && Files.exists(cwd.resolve("uploads"))) {
            candidate = cwd.resolve("uploads").normalize();
        }

        return candidate;
    }
}
