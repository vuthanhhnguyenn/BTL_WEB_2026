package com.troxinh.backend.repository;

import com.troxinh.backend.entity.RoomReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomReportRepository extends JpaRepository<RoomReport, Long> {

    long countByRoomId(Long roomId);

    @Query("""
    SELECT rr.room.id, COUNT(rr)
    FROM RoomReport rr
    WHERE rr.room.id IN :roomIds
    GROUP BY rr.room.id
    """)
    List<Object[]> countByRoomIds(@Param("roomIds") List<Long> roomIds);

    List<RoomReport> findAllByOrderByCreatedAtDesc();

    void deleteByRoomId(Long roomId);
}
