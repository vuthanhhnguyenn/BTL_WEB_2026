package com.troxinh.backend.controller;

import com.troxinh.backend.dto.room.RoomCreateRequest;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.dto.room.RoomUpdateRequest;
import com.troxinh.backend.service.RoomDetailService;
import com.troxinh.backend.service.RoomQueryService;
import com.troxinh.backend.service.RoomWriteService;
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

    public RoomController(
        RoomDetailService roomDetailService,
        RoomQueryService roomQueryService,
        RoomWriteService roomWriteService
    ) {
        this.roomDetailService = roomDetailService;
        this.roomQueryService = roomQueryService;
        this.roomWriteService = roomWriteService;
    }

    @GetMapping("/{id:\\d+}")
    public RoomDetailResponse getRoomDetail(@PathVariable Long id) {
        return roomDetailService.getRoomDetail(id);
    }

    @GetMapping("/ids/first-12")
    public List<Long> getFirst12RoomIds() {
        return roomQueryService.getFirst12RoomIds();
    }

    @GetMapping("/initial")
    public RoomSearchResponse getInitialRooms(@RequestParam(defaultValue = "5") Integer limit) {
        return roomQueryService.getInitialRooms(limit);
    }

    @GetMapping("/search")
    public RoomSearchResponse searchRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice
    ) {
        return roomQueryService.searchRooms(keyword, district, minPrice, maxPrice);
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
        return roomQueryService.getAllRoomsForAdmin();
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long userId = roomWriteService.getUserIdFromToken(authorizationHeader);
        if (roomWriteService.isAdmin(authorizationHeader)) {
            roomDetailService.deleteRoomAsAdmin(id);
        } else {
            roomWriteService.deleteRoom(id, userId, authorizationHeader);
        }
        return ResponseEntity.noContent().build();
    }
}
