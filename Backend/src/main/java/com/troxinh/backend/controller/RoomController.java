package com.troxinh.backend.controller;

import com.troxinh.backend.dto.room.RoomCreateRequest;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.dto.room.OwnerRoomStatsResponse;
import com.troxinh.backend.dto.room.RoomReportRequest;
import com.troxinh.backend.dto.room.RoomReportResponse;
import com.troxinh.backend.dto.room.RoomUpdateRequest;
import com.troxinh.backend.dto.user.SavedSearchRequest;
import com.troxinh.backend.dto.user.SavedSearchResponse;
import com.troxinh.backend.service.RoomDetailService;
import com.troxinh.backend.service.RoomQueryService;
import com.troxinh.backend.service.RoomWriteService;
import com.troxinh.backend.service.UserFeatureService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.troxinh.backend.dto.room.RoomSearchResponse;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomDetailService roomDetailService;
    private final RoomQueryService roomQueryService;
    private final RoomWriteService roomWriteService;
    private final UserFeatureService userFeatureService;

    public RoomController(
        RoomDetailService roomDetailService,
        RoomQueryService roomQueryService,
        RoomWriteService roomWriteService,
        UserFeatureService userFeatureService
    ) {
        this.roomDetailService = roomDetailService;
        this.roomQueryService = roomQueryService;
        this.roomWriteService = roomWriteService;
        this.userFeatureService = userFeatureService;
    }

    @GetMapping("/{id:\\d+}")
    public RoomDetailResponse getRoomDetail(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        return roomDetailService.getRoomDetail(id, userId);
    }

    @GetMapping("/{id:\\d+}/edit")
    public RoomDetailResponse getRoomForEdit(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        if (!roomWriteService.canEditRoom(id, userId, authorizationHeader)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own rooms");
        }
        return roomDetailService.getRoomForEdit(id, userId);
    }

    @GetMapping("/ids/first-12")
    public List<Long> getFirst12RoomIds() {
        return roomQueryService.getFirst12RoomIds();
    }

    @GetMapping("/initial")
    public RoomSearchResponse getInitialRooms(
        @RequestParam(defaultValue = "5") Integer limit,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        return roomQueryService.getInitialRooms(limit, userId);
    }

    @GetMapping("/highlights")
    public RoomSearchResponse getHighlights(
        @RequestParam(defaultValue = "12") Integer limit,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        return roomQueryService.getHighlights(limit, userId);
    }

    @GetMapping("/search")
    public RoomSearchResponse searchRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        return roomQueryService.searchRooms(keyword, district, minPrice, maxPrice, userId);
    }

    @GetMapping("/my")
    public RoomSearchResponse getMyRooms(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        if (userId == null) {
            return new RoomSearchResponse(List.of(), 0);
        }
        return roomQueryService.getRoomsByUserId(userId);
    }

    @GetMapping("/admin/all")
    public RoomSearchResponse getAllRoomsForAdmin(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (!roomWriteService.isAdmin(authorizationHeader)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        return roomQueryService.getAllRoomsForAdmin(userId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomDetailResponse> createRoom(
        @Valid @RequestPart("data") RoomCreateRequest request,
        @RequestPart(value = "images", required = false) List<MultipartFile> images,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(roomWriteService.createRoom(request, images, authorizationHeader));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomDetailResponse> updateRoom(
        @PathVariable Long id,
        @Valid @RequestPart("data") RoomUpdateRequest request,
        @RequestPart(value = "images", required = false) List<MultipartFile> images,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        return ResponseEntity.ok(roomWriteService.updateRoom(id, request, images, userId, authorizationHeader));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRoomStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (!roomWriteService.isAdmin(authorizationHeader)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        String status = body.get("status");
        roomDetailService.updateStatus(id, status);
        return ResponseEntity.ok(Map.of("success", true, "message", "Room status updated"));
    }

    @PutMapping("/{id}/featured")
    public ResponseEntity<RoomDetailResponse> updateFeatured(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> body,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        boolean featured = Boolean.TRUE.equals(body.get("featured"));
        return ResponseEntity.ok(roomWriteService.updateFeatured(id, featured, userId, authorizationHeader));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Object>> addFavorite(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        userFeatureService.addFavorite(userId, id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Object>> removeFavorite(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        userFeatureService.removeFavorite(userId, id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/favorites/my")
    public RoomSearchResponse getMyFavorites(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        Long userId = requireUserId(authorizationHeader);
        List<RoomDetailResponse> rooms = userFeatureService.getFavoriteRooms(userId);
        return new RoomSearchResponse(rooms, rooms.size());
    }

    @PostMapping("/saved-searches")
    public ResponseEntity<SavedSearchResponse> saveSearch(
        @Valid @RequestBody SavedSearchRequest request,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(userFeatureService.saveSearch(userId, request));
    }

    @GetMapping("/saved-searches/my")
    public List<SavedSearchResponse> getSavedSearches(
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        return userFeatureService.getSavedSearches(userId);
    }

    @DeleteMapping("/saved-searches/{id}")
    public ResponseEntity<Map<String, Object>> deleteSavedSearch(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        userFeatureService.deleteSavedSearch(userId, id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/my/stats")
    public OwnerRoomStatsResponse getOwnerStats(
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        return userFeatureService.getOwnerStats(userId);
    }

    @PostMapping("/{id}/reports")
    public ResponseEntity<RoomReportResponse> createReport(
        @PathVariable Long id,
        @Valid @RequestBody RoomReportRequest request,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = requireUserId(authorizationHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(userFeatureService.createReport(id, userId, request));
    }

    @GetMapping("/admin/reports")
    public List<RoomReportResponse> getAdminReports(
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (!roomWriteService.isAdmin(authorizationHeader)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return userFeatureService.getAdminReports();
    }

    @PutMapping("/admin/reports/{id}/status")
    public RoomReportResponse updateReportStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (!roomWriteService.isAdmin(authorizationHeader)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return userFeatureService.updateReportStatus(id, body.getOrDefault("status", "REVIEWED"));
    }

    @PostMapping("/{id}/contact-click")
    public ResponseEntity<Map<String, Object>> recordContactClick(@PathVariable Long id) {
        roomDetailService.incrementContactClick(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        roomWriteService.deleteRoom(id, userId, authorizationHeader);
        return ResponseEntity.noContent().build();
    }

    private Long requireUserId(String authorizationHeader) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userId;
    }
}
