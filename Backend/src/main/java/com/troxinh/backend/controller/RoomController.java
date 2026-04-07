package com.troxinh.backend.controller;

import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.service.RoomDetailService;
import com.troxinh.backend.service.RoomQueryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.troxinh.backend.dto.room.RoomSearchResponse;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomDetailService roomDetailService;
    private final RoomQueryService roomQueryService;

    public RoomController(RoomDetailService roomDetailService, RoomQueryService roomQueryService) {
        this.roomDetailService = roomDetailService;
        this.roomQueryService = roomQueryService;
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

}
