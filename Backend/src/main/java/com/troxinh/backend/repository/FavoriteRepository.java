package com.troxinh.backend.repository;

import com.troxinh.backend.entity.Favorite;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserIdAndRoomId(Long userId, Long roomId);

    long countByRoomId(Long roomId);

    @Query("""
    SELECT f.room.id, COUNT(f)
    FROM Favorite f
    WHERE f.room.id IN :roomIds
    GROUP BY f.room.id
    """)
    List<Object[]> countByRoomIds(@Param("roomIds") List<Long> roomIds);

    @Query("""
    SELECT f.room.id
    FROM Favorite f
    WHERE f.user.id = :userId AND f.room.id IN :roomIds
    """)
    Set<Long> findFavoritedRoomIds(@Param("userId") Long userId, @Param("roomIds") List<Long> roomIds);

    @Query("SELECT f FROM Favorite f JOIN FETCH f.room r " +
           "LEFT JOIN FETCH r.user " +
           "WHERE f.user.id = :userId ORDER BY f.createdAt DESC")
    List<Favorite> findByUserIdWithRoom(@Param("userId") Long userId);

    default List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return findByUserIdWithRoom(userId);
    }

    void deleteByUserIdAndRoomId(Long userId, Long roomId);

    void deleteByRoomId(Long roomId);
}
