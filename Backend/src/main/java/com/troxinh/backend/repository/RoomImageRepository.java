package com.troxinh.backend.repository;

import com.troxinh.backend.entity.RoomImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    List<RoomImage> findByRoomIdOrderBySortOrderAscIdAsc(Long roomId);

    @Query("""
    SELECT ri FROM RoomImage ri
    WHERE ri.room.id IN :roomIds
    ORDER BY ri.room.id ASC, ri.sortOrder ASC, ri.id ASC
    """)
    List<RoomImage> findAllByRoomIdsOrderByRoomIdAscSortOrderAscIdAsc(@Param("roomIds") List<Long> roomIds);
}
