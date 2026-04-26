package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class RoomDetailService {

    private final RoomRepository roomRepository;
    private final RoomResponseMapper roomResponseMapper;

    public RoomDetailService(RoomRepository roomRepository, RoomResponseMapper roomResponseMapper) {
        this.roomRepository = roomRepository;
        this.roomResponseMapper = roomResponseMapper;
    }

    public RoomDetailResponse getRoomDetail(Long id, Long currentUserId) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Khong tim thay phong voi id=" + id));

        room.setViewCount((room.getViewCount() == null ? 0 : room.getViewCount()) + 1);
        Room savedRoom = roomRepository.save(room);
        return roomResponseMapper.toRoomDetailResponse(savedRoom, currentUserId);
    }

    public void updateStatus(Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Khong tim thay phong voi id=" + roomId));
        room.setStatus(status == null ? room.getStatus() : status.trim().toUpperCase());
        roomRepository.save(room);
    }

    public void deleteRoomAsAdmin(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Khong tim thay phong voi id=" + roomId));
        roomRepository.delete(room);
    }

    public void incrementContactClick(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Khong tim thay phong voi id=" + roomId));
        room.setContactClickCount((room.getContactClickCount() == null ? 0 : room.getContactClickCount()) + 1);
        roomRepository.save(room);
    }
}
