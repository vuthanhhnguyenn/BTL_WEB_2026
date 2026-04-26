package com.troxinh.backend.repository;

import com.troxinh.backend.entity.Favorite;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserIdAndRoomId(Long userId, Long roomId);

    long countByRoomId(Long roomId);

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserIdAndRoomId(Long userId, Long roomId);

    void deleteByRoomId(Long roomId);
}
