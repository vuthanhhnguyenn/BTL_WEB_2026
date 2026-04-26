package com.troxinh.backend.repository;

import com.troxinh.backend.entity.RoomContact;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomContactRepository extends JpaRepository<RoomContact, Long> {

    Optional<RoomContact> findByRoomId(Long roomId);
    void deleteByRoomId(Long roomId);

    @Query("""
    SELECT rc FROM RoomContact rc
    WHERE rc.room.id IN :roomIds
    """)
    List<RoomContact> findAllByRoomIds(@Param("roomIds") List<Long> roomIds);
}
