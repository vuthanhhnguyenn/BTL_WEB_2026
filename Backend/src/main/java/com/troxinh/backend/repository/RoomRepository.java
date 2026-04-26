package com.troxinh.backend.repository;

import com.troxinh.backend.entity.Room;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findById(Long id);
    List<Room> findTop12ByOrderByIdAsc();

    List<Room> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Room> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    @Query("""
    SELECT r FROM Room r
    WHERE UPPER(COALESCE(r.status, 'APPROVED')) IN ('APPROVED', 'AVAILABLE')
    ORDER BY COALESCE(r.isFeatured, false) DESC, COALESCE(r.viewCount, 0) DESC, r.id DESC
    """)
    List<Room> findPublicRooms(Pageable pageable);

    @Query("""
    SELECT r FROM Room r
    WHERE UPPER(COALESCE(r.status, 'APPROVED')) IN ('APPROVED', 'AVAILABLE')
    ORDER BY COALESCE(r.isFeatured, false) DESC, COALESCE(r.viewCount, 0) DESC, r.id DESC
    """)
    List<Room> findHighlights(Pageable pageable);

    @Query("""
    SELECT r FROM Room r
    WHERE (:keyword IS NULL OR LOWER(r.city) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%')))
    AND (:district IS NULL OR LOWER(r.district) LIKE LOWER(CONCAT('%', :district, '%')))
    AND (:minPrice IS NULL OR r.priceTo >= :minPrice)
    AND (:maxPrice IS NULL OR r.priceFrom <= :maxPrice)
    AND (UPPER(COALESCE(r.status, 'APPROVED')) IN ('APPROVED', 'AVAILABLE'))
    ORDER BY COALESCE(r.isFeatured, false) DESC, r.id DESC
    """)
    List<Room> searchRooms(
        @Param("keyword") String keyword,
        @Param("district") String district,
        @Param("minPrice") Long minPrice,
        @Param("maxPrice") Long maxPrice
    );

}
