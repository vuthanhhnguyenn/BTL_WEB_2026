package com.troxinh.backend.controller;

import com.troxinh.backend.dto.room.RoomCreateRequest;
import com.troxinh.backend.dto.room.RoomDetailResponse;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.troxinh.backend.dto.room.RoomSearchResponse;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomDetailResponse> createRoom(
        @Valid @RequestPart("data") RoomCreateRequest request,
        @RequestPart(value = "images", required = false) List<MultipartFile> images,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(roomWriteService.createRoom(request, images, authorizationHeader));
    }
}
