package com.troxinh.backend.repository;

import com.troxinh.backend.entity.RoomReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomReportRepository extends JpaRepository<RoomReport, Long> {

    long countByRoomId(Long roomId);

    List<RoomReport> findAllByOrderByCreatedAtDesc();

    void deleteByRoomId(Long roomId);
}
