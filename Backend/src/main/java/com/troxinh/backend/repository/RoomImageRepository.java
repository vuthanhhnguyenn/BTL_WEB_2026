package com.troxinh.backend.repository;

import com.troxinh.backend.entity.RoomImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    List<RoomImage> findByRoomIdOrderBySortOrderAscIdAsc(Long roomId);
}
