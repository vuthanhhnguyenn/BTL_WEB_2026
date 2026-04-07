package com.troxinh.backend.repository;

import com.troxinh.backend.entity.RoomContact;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomContactRepository extends JpaRepository<RoomContact, Long> {

    Optional<RoomContact> findByRoomId(Long roomId);
}
