package com.troxinh.backend.service;

import com.troxinh.backend.dto.room.OwnerRoomStatsResponse;
import com.troxinh.backend.dto.room.RoomDetailResponse;
import com.troxinh.backend.dto.room.RoomReportRequest;
import com.troxinh.backend.dto.room.RoomReportResponse;
import com.troxinh.backend.dto.user.SavedSearchRequest;
import com.troxinh.backend.dto.user.SavedSearchResponse;
import com.troxinh.backend.entity.Favorite;
import com.troxinh.backend.entity.Room;
import com.troxinh.backend.entity.RoomReport;
import com.troxinh.backend.entity.SavedSearch;
import com.troxinh.backend.entity.User;
import com.troxinh.backend.repository.FavoriteRepository;
import com.troxinh.backend.repository.RoomReportRepository;
import com.troxinh.backend.repository.RoomRepository;
import com.troxinh.backend.repository.SavedSearchRepository;
import com.troxinh.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class UserFeatureService {

    private static final String DEFAULT_REPORT_STATUS = "OPEN";

    private final FavoriteRepository favoriteRepository;
    private final SavedSearchRepository savedSearchRepository;
    private final RoomReportRepository roomReportRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomResponseMapper roomResponseMapper;

    public UserFeatureService(
        FavoriteRepository favoriteRepository,
        SavedSearchRepository savedSearchRepository,
        RoomReportRepository roomReportRepository,
        RoomRepository roomRepository,
        UserRepository userRepository,
        RoomResponseMapper roomResponseMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.savedSearchRepository = savedSearchRepository;
        this.roomReportRepository = roomReportRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomResponseMapper = roomResponseMapper;
    }

    @Transactional
    public void addFavorite(Long userId, Long roomId) {
        if (favoriteRepository.existsByUserIdAndRoomId(userId, roomId)) {
            return;
        }

        User user = getUser(userId);
        Room room = getRoom(roomId);

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setRoom(room);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long roomId) {
        favoriteRepository.deleteByUserIdAndRoomId(userId, roomId);
    }

    public List<RoomDetailResponse> getFavoriteRooms(Long userId) {
        return favoriteRepository.findByUserIdWithRoom(userId)
            .stream()
            .map(Favorite::getRoom)
            .map(room -> roomResponseMapper.toRoomDetailResponse(room, userId))
            .toList();
    }

    @Transactional
    public SavedSearchResponse saveSearch(Long userId, SavedSearchRequest request) {
        User user = getUser(userId);
        SavedSearch savedSearch = new SavedSearch();
        savedSearch.setUser(user);
        savedSearch.setName(normalize(request.name()));
        savedSearch.setKeyword(normalizeNullable(request.keyword()));
        savedSearch.setDistrict(normalizeNullable(request.district()));
        savedSearch.setMinPrice(request.minPrice());
        savedSearch.setMaxPrice(request.maxPrice());

        SavedSearch saved = savedSearchRepository.save(savedSearch);
        return toSavedSearchResponse(saved);
    }

    public List<SavedSearchResponse> getSavedSearches(Long userId) {
        return savedSearchRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::toSavedSearchResponse)
            .toList();
    }

    @Transactional
    public void deleteSavedSearch(Long userId, Long savedSearchId) {
        savedSearchRepository.deleteByIdAndUserId(savedSearchId, userId);
    }

    @Transactional
    public RoomReportResponse createReport(Long roomId, Long reporterId, RoomReportRequest request) {
        Room room = getRoom(roomId);
        User reporter = getUser(reporterId);

        RoomReport report = new RoomReport();
        report.setRoom(room);
        report.setReporter(reporter);
        report.setReason(normalize(request.reason()));
        report.setDetailText(normalizeNullable(request.detail()));
        report.setStatus(DEFAULT_REPORT_STATUS);

        RoomReport saved = roomReportRepository.save(report);
        return toRoomReportResponse(saved);
    }

    public List<RoomReportResponse> getAdminReports() {
        return roomReportRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::toRoomReportResponse)
            .toList();
    }

    public RoomReportResponse updateReportStatus(Long reportId, String status) {
        RoomReport report = roomReportRepository.findById(reportId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setStatus(normalize(status).toUpperCase());
        return toRoomReportResponse(roomReportRepository.save(report));
    }

    public OwnerRoomStatsResponse getOwnerStats(Long userId) {
        List<Room> rooms = roomRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long totalFavorites = rooms.stream()
            .mapToLong(room -> favoriteRepository.countByRoomId(room.getId()))
            .sum();

        return new OwnerRoomStatsResponse(
            rooms.size(),
            rooms.stream().filter(room -> Boolean.TRUE.equals(room.getIsFeatured())).count(),
            rooms.stream().mapToLong(room -> room.getViewCount() == null ? 0 : room.getViewCount()).sum(),
            rooms.stream().mapToLong(room -> room.getContactClickCount() == null ? 0 : room.getContactClickCount()).sum(),
            totalFavorites
        );
    }

    private SavedSearchResponse toSavedSearchResponse(SavedSearch savedSearch) {
        return new SavedSearchResponse(
            savedSearch.getId(),
            savedSearch.getName(),
            savedSearch.getKeyword(),
            savedSearch.getDistrict(),
            savedSearch.getMinPrice(),
            savedSearch.getMaxPrice(),
            savedSearch.getCreatedAt()
        );
    }

    private RoomReportResponse toRoomReportResponse(RoomReport report) {
        return new RoomReportResponse(
            report.getId(),
            report.getRoom().getId(),
            report.getRoom().getTitle(),
            report.getReporter().getId(),
            report.getReporter().getFullName(),
            report.getReason(),
            report.getDetailText(),
            report.getStatus(),
            report.getCreatedAt()
        );
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Room getRoom(Long roomId) {
        return roomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeNullable(String value) {
        String normalized = normalize(value);
        return normalized.isEmpty() ? null : normalized;
    }
}
