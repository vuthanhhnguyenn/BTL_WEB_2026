(() => {
  const { API_BASE_URL, USE_MOCK, STORAGE_KEYS } = window.AppConfig;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const resolveImageUrl = (url) => {
    if (!url) return url;
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    )
      return url;
    const base = API_BASE_URL.replace(/\/api\/v1$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getStorageJson = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  };

  const setStorageJson = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  const getLocalRooms = () => getStorageJson(STORAGE_KEYS.ROOMS, []);
  const setLocalRooms = (rooms) => setStorageJson(STORAGE_KEYS.ROOMS, rooms);
  const getLocalFavorites = () => getStorageJson(STORAGE_KEYS.FAVORITES, []);
  const setLocalFavorites = (favorites) =>
    setStorageJson(STORAGE_KEYS.FAVORITES, favorites);
  const getLocalSavedSearches = () =>
    getStorageJson(STORAGE_KEYS.SAVED_SEARCHES, []);
  const setLocalSavedSearches = (savedSearches) =>
    setStorageJson(STORAGE_KEYS.SAVED_SEARCHES, savedSearches);
  const getLocalReports = () => getStorageJson(STORAGE_KEYS.REPORTS, []);
  const setLocalReports = (reports) =>
    setStorageJson(STORAGE_KEYS.REPORTS, reports);

  const getAllMockRooms = () => [...window.DEMO_ROOMS, ...getLocalRooms()];

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "null");
    } catch {
      return null;
    }
  };

  const saveUser = (user) => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const normalizeMockRoom = (room) => {
    const favoriteIds = new Set(
      getLocalFavorites().map((item) => Number(item.roomId)),
    );
    const reports = getLocalReports();
    return {
      ...room,
      images: Array.isArray(room.images)
        ? room.images.map(resolveImageUrl)
        : [],
      featured: Boolean(room.featured ?? room.isFeatured),
      favorited: favoriteIds.has(Number(room.id)),
      viewCount: Number(room.viewCount || 0),
      contactClickCount: Number(room.contactClickCount || 0),
      favoriteCount: getLocalFavorites().filter(
        (item) => Number(item.roomId) === Number(room.id),
      ).length,
      reportCount: reports.filter(
        (item) => Number(item.roomId) === Number(room.id),
      ).length,
    };
  };

  const normalizeRoomImages = (room) => {
    if (!room) return room;
    const normalizedImages = Array.isArray(room.images)
      ? room.images.map(resolveImageUrl)
      : [];
    return {
      ...room,
      images: normalizedImages,
      featured: Boolean(room.featured),
      favorited: Boolean(room.favorited),
      viewCount: Number(room.viewCount || 0),
      contactClickCount: Number(room.contactClickCount || 0),
      favoriteCount: Number(room.favoriteCount || 0),
      reportCount: Number(room.reportCount || 0),
    };
  };

  const normalizeRoomPage = (data) => {
    if (!data || !Array.isArray(data.content)) return data;
    return { ...data, content: data.content.map(normalizeRoomImages) };
  };

  const request = async (path, options = {}) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const shouldAttachToken = token && (options.auth || options.optionalAuth);
    const headers = {
      ...(options.rawBody ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      ...(shouldAttachToken ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = text || "Không thể kết nối API backend.";

      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch {
        // Keep text fallback.
      }

      throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  const filterRooms = (rooms, params = {}) => {
    const keyword = String(params.keyword || "")
      .toLowerCase()
      .trim();
    const district = String(params.district || "")
      .toLowerCase()
      .trim();
    const minPrice = Number(params.minPrice || 0);
    const maxPrice = Number(params.maxPrice || 0);

    return rooms.filter((room) => {
      const roomMin = Number(room.priceFrom || 0);
      const roomMax = Number(room.priceTo || room.priceFrom || 0);
      const matchesKeyword =
        !keyword ||
        String(room.title || "")
          .toLowerCase()
          .includes(keyword) ||
        String(room.address || "")
          .toLowerCase()
          .includes(keyword) ||
        String(room.city || "")
          .toLowerCase()
          .includes(keyword);
      const matchesDistrict =
        !district ||
        String(room.district || "")
          .toLowerCase()
          .includes(district);
      const matchesMin = !minPrice || roomMax >= minPrice;
      const matchesMax = !maxPrice || roomMin <= maxPrice;
      return matchesKeyword && matchesDistrict && matchesMin && matchesMax;
    });
  };

  const getRooms = async (params = {}) => {
    if (USE_MOCK) {
      const rooms = filterRooms(
        getAllMockRooms().map(normalizeMockRoom),
        params,
      );
      return normalizeRoomPage({ content: rooms, totalElements: rooms.length });
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        query.set(key, value);
    });
    return request(`/rooms/search?${query.toString()}`, {
      optionalAuth: true,
    }).then(normalizeRoomPage);
  };

  const getInitialRooms = async (limit = 5) => {
    if (USE_MOCK) {
      const rooms = getAllMockRooms()
        .map(normalizeMockRoom)
        .sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            Number(b.id) - Number(a.id),
        )
        .slice(0, limit);
      return normalizeRoomPage({ content: rooms, totalElements: rooms.length });
    }
    return request(`/rooms/initial?limit=${Number(limit) || 5}`, {
      optionalAuth: true,
    }).then(normalizeRoomPage);
  };

  const getFeaturedRooms = async (limit = 12) => {
    if (USE_MOCK) {
      const rooms = getAllMockRooms()
        .map(normalizeMockRoom)
        .sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            Number(b.viewCount || 0) - Number(a.viewCount || 0) ||
            Number(b.id) - Number(a.id),
        )
        .slice(0, limit);
      return normalizeRoomPage({ content: rooms, totalElements: rooms.length });
    }
    return request(`/rooms/highlights?limit=${Number(limit) || 12}`, {
      optionalAuth: true,
    }).then(normalizeRoomPage);
  };

  const getRoomById = async (id) => {
    if (USE_MOCK) {
      const rooms = getAllMockRooms();
      const index = rooms.findIndex((room) => Number(room.id) === Number(id));
      if (index === -1) return null;
      rooms[index] = {
        ...rooms[index],
        viewCount: Number(rooms[index].viewCount || 0) + 1,
      };
      if (index >= window.DEMO_ROOMS.length) {
        const locals = getLocalRooms();
        locals[index - window.DEMO_ROOMS.length] = rooms[index];
        setLocalRooms(locals);
      }
      return normalizeMockRoom(rooms[index]);
    }
    return request(`/rooms/${id}`, { optionalAuth: true }).then(
      normalizeRoomImages,
    );
  };

  const getRoomForEdit = async (id) => {
    if (USE_MOCK) {
      const room = getAllMockRooms().find(
        (item) => Number(item.id) === Number(id),
      );
      if (!room) return null;
      const currentUser = getCurrentUser();
      const isOwner = Number(room.userId) === Number(currentUser?.id);
      if (!isOwner && !isAdmin()) {
        throw new Error("Bạn không có quyền sửa bài đăng này.");
      }
      return normalizeMockRoom(room);
    }
    return request(`/rooms/${id}/edit`, { auth: true }).then(
      normalizeRoomImages,
    );
  };

  const login = async ({ email, password }) => {
    if (USE_MOCK) {
      const data = {
        token: "mock-jwt-token",
        user: { id: 1, fullName: "Người dùng demo", email, role: "USER" },
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      saveUser(data.user);
      return data;
    }

    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    if (data.user) saveUser(data.user);
    return data;
  };

  const register = async (payload) => {
    if (USE_MOCK)
      return { success: true, message: "Đăng ký thành công (mock)." };
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const createListing = async (roomPayload, imageFiles = []) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const ids = getAllMockRooms().map((room) => Number(room.id) || 0);
      const nextId = (Math.max(...ids, 0) || 0) + 1;
      const currentUser = getCurrentUser();
      const previewImages = imageFiles.length
        ? imageFiles.map((file) => URL.createObjectURL(file))
        : [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
          ];

      const newRoom = {
        ...roomPayload,
        id: nextId,
        userId: currentUser?.id,
        status: "PENDING",
        images: previewImages,
        featured: false,
        viewCount: 0,
        contactClickCount: 0,
      };
      localRooms.push(newRoom);
      setLocalRooms(localRooms);
      return normalizeMockRoom(newRoom);
    }

    try {
      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(roomPayload)], { type: "application/json" }),
      );
      imageFiles.forEach((file) => formData.append("images", file));
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

      console.log("Creating listing with token:", !!token);

      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      console.log("API response status:", response.status, response.statusText);

      if (!response.ok) {
        const text = await response.text();
        let message = text || "Không thể đăng bài lúc này.";

        try {
          const parsed = JSON.parse(text);
          message = parsed.message || parsed.error || message;
        } catch {
          // Giữ nguyên thông báo text nếu response không phải JSON.
        }

        throw new Error(`API Error: ${response.status} - ${message}`);
      }

      const responseData = await response.text();
      console.log("API response data:", responseData);

      return { success: true };
    } catch (error) {
      console.error("createListing error:", error);
      throw error;
    }
  };

  const getUserProfile = async (id) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      if (currentUser && Number(currentUser.id) === Number(id))
        return currentUser;
      throw new Error("Không tìm thấy người dùng");
    }
    return request(`/users/${id}`, { auth: true });
  };

  const updateUserProfile = async (id, payload) => {
    if (USE_MOCK) {
      const updated = { ...(getCurrentUser() || {}), ...payload };
      saveUser(updated);
      return updated;
    }
    const updatedUser = await request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      auth: true,
    });
    saveUser(updatedUser);
    return updatedUser;
  };

  const changePassword = async (id, oldPassword, newPassword) => {
    if (USE_MOCK)
      return { success: true, message: "Đã đổi mật khẩu thành công (mock)" };
    return request(`/users/${id}/change-password`, {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
      auth: true,
    });
  };

  const getFirst12RoomIds = async () => {
    if (USE_MOCK)
      return getAllMockRooms()
        .map((room) => Number(room.id))
        .slice(0, 12);
    return request("/rooms/ids/first-12");
  };

  const getMyRooms = async () => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      const rooms = getLocalRooms()
        .filter((room) => Number(room.userId) === Number(currentUser?.id))
        .map(normalizeMockRoom);
      return normalizeRoomPage({ content: rooms, totalElements: rooms.length });
    }
    return request("/rooms/my", { auth: true }).then(normalizeRoomPage);
  };

  const updateRoom = async (id, roomPayload, imageFiles = []) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const index = localRooms.findIndex(
        (room) => Number(room.id) === Number(id),
      );
      if (index === -1) throw new Error("Không tìm thấy phòng");
      localRooms[index] = {
        ...localRooms[index],
        ...roomPayload,
        images: imageFiles.length
          ? imageFiles.map((file) => URL.createObjectURL(file))
          : localRooms[index].images,
      };
      setLocalRooms(localRooms);
      return normalizeMockRoom(localRooms[index]);
    }

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(roomPayload)], { type: "application/json" }),
    );
    imageFiles.forEach((file) => formData.append("images", file));

    return request(`/rooms/${id}`, {
      method: "PUT",
      body: formData,
      auth: true,
      rawBody: true,
    }).then(normalizeRoomImages);
  };

  const deleteRoom = async (id) => {
    if (USE_MOCK) {
      setLocalRooms(
        getLocalRooms().filter((room) => Number(room.id) !== Number(id)),
      );
      setLocalFavorites(
        getLocalFavorites().filter(
          (item) => Number(item.roomId) !== Number(id),
        ),
      );
      setLocalReports(
        getLocalReports().filter((item) => Number(item.roomId) !== Number(id)),
      );
      return true;
    }
    return request(`/rooms/${id}`, { method: "DELETE", auth: true });
  };

  const getAllRoomsForAdmin = async () => {
    if (USE_MOCK) {
      const rooms = getAllMockRooms().map(normalizeMockRoom);
      return { content: rooms, totalElements: rooms.length };
    }
    return request("/rooms/admin/all", { auth: true }).then(normalizeRoomPage);
  };

  const updateRoomStatus = async (id, status) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const index = localRooms.findIndex(
        (room) => Number(room.id) === Number(id),
      );
      if (index !== -1) {
        localRooms[index] = { ...localRooms[index], status };
        setLocalRooms(localRooms);
      }
      return { success: true };
    }
    return request(`/rooms/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      auth: true,
    });
  };

  const setRoomFeatured = async (id, featured) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const index = localRooms.findIndex(
        (room) => Number(room.id) === Number(id),
      );
      if (index !== -1) {
        localRooms[index] = { ...localRooms[index], featured };
        setLocalRooms(localRooms);
        return normalizeMockRoom(localRooms[index]);
      }
      throw new Error("Không tìm thấy phòng");
    }
    return request(`/rooms/${id}/featured`, {
      method: "PUT",
      body: JSON.stringify({ featured }),
      auth: true,
    }).then(normalizeRoomImages);
  };

  const getOwnerStats = async () => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      const rooms = getLocalRooms()
        .filter((room) => Number(room.userId) === Number(currentUser?.id))
        .map(normalizeMockRoom);
      return {
        totalRooms: rooms.length,
        featuredRooms: rooms.filter((room) => room.featured).length,
        totalViews: rooms.reduce(
          (sum, room) => sum + Number(room.viewCount || 0),
          0,
        ),
        totalContactClicks: rooms.reduce(
          (sum, room) => sum + Number(room.contactClickCount || 0),
          0,
        ),
        totalFavorites: rooms.reduce(
          (sum, room) => sum + Number(room.favoriteCount || 0),
          0,
        ),
      };
    }
    return request("/rooms/my/stats", { auth: true });
  };

  const addFavorite = async (roomId) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      const favorites = getLocalFavorites();
      if (
        !favorites.some(
          (item) =>
            Number(item.roomId) === Number(roomId) &&
            Number(item.userId) === Number(currentUser?.id),
        )
      ) {
        favorites.push({
          id: Date.now(),
          userId: currentUser?.id,
          roomId: Number(roomId),
          createdAt: new Date().toISOString(),
        });
        setLocalFavorites(favorites);
      }
      return { success: true };
    }
    return request(`/rooms/${roomId}/favorite`, { method: "POST", auth: true });
  };

  const removeFavorite = async (roomId) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      setLocalFavorites(
        getLocalFavorites().filter(
          (item) =>
            !(
              Number(item.roomId) === Number(roomId) &&
              Number(item.userId) === Number(currentUser?.id)
            ),
        ),
      );
      return { success: true };
    }
    return request(`/rooms/${roomId}/favorite`, {
      method: "DELETE",
      auth: true,
    });
  };

  const toggleFavorite = async (roomId, shouldFavorite) => {
    return shouldFavorite ? addFavorite(roomId) : removeFavorite(roomId);
  };

  const getMyFavorites = async () => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      const ids = new Set(
        getLocalFavorites()
          .filter((item) => Number(item.userId) === Number(currentUser?.id))
          .map((item) => Number(item.roomId)),
      );
      const rooms = getAllMockRooms()
        .filter((room) => ids.has(Number(room.id)))
        .map(normalizeMockRoom);
      return normalizeRoomPage({ content: rooms, totalElements: rooms.length });
    }
    return request("/rooms/favorites/my", { auth: true }).then(
      normalizeRoomPage,
    );
  };

  const saveSearch = async (payload) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      const searches = getLocalSavedSearches();
      const saved = {
        id: Date.now(),
        userId: currentUser?.id,
        createdAt: new Date().toISOString(),
        ...payload,
      };
      searches.unshift(saved);
      setLocalSavedSearches(searches);
      return saved;
    }
    return request("/rooms/saved-searches", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    });
  };

  const getSavedSearches = async () => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      return getLocalSavedSearches().filter(
        (item) => Number(item.userId) === Number(currentUser?.id),
      );
    }
    return request("/rooms/saved-searches/my", { auth: true });
  };

  const deleteSavedSearch = async (id) => {
    if (USE_MOCK) {
      setLocalSavedSearches(
        getLocalSavedSearches().filter(
          (item) => Number(item.id) !== Number(id),
        ),
      );
      return { success: true };
    }
    return request(`/rooms/saved-searches/${id}`, {
      method: "DELETE",
      auth: true,
    });
  };

  const reportRoom = async (roomId, payload) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      const room = getAllMockRooms().find(
        (item) => Number(item.id) === Number(roomId),
      );
      const reports = getLocalReports();
      const saved = {
        id: Date.now(),
        roomId: Number(roomId),
        roomTitle: room?.title || "Phòng",
        reporterId: currentUser?.id,
        reporterName: currentUser?.fullName || "Người dùng",
        reason: payload.reason,
        detail: payload.detail,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };
      reports.unshift(saved);
      setLocalReports(reports);
      return saved;
    }
    return request(`/rooms/${roomId}/reports`, {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    });
  };

  const getAdminReports = async () => {
    if (USE_MOCK) return getLocalReports();
    return request("/rooms/admin/reports", { auth: true });
  };

  const updateReportStatus = async (id, status) => {
    if (USE_MOCK) {
      const reports = getLocalReports();
      const index = reports.findIndex((item) => Number(item.id) === Number(id));
      if (index !== -1) {
        reports[index] = { ...reports[index], status };
        setLocalReports(reports);
        return reports[index];
      }
      throw new Error("Không tìm thấy báo cáo");
    }
    return request(`/rooms/admin/reports/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      auth: true,
    });
  };

  const recordContactClick = async (roomId) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const index = localRooms.findIndex(
        (room) => Number(room.id) === Number(roomId),
      );
      if (index !== -1) {
        localRooms[index] = {
          ...localRooms[index],
          contactClickCount:
            Number(localRooms[index].contactClickCount || 0) + 1,
        };
        setLocalRooms(localRooms);
      }
      return { success: true };
    }
    return request(`/rooms/${roomId}/contact-click`, { method: "POST" });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const isAdmin = () =>
    String(getCurrentUser()?.role || "").toUpperCase() === "ADMIN";

  window.ApiService = {
    formatCurrency,
    getInitialRooms,
    getFeaturedRooms,
    getRooms,
    getRoomById,
    getRoomForEdit,
    getFirst12RoomIds,
    login,
    register,
    createListing,
    logout,
    getCurrentUser,
    saveUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getMyRooms,
    updateRoom,
    deleteRoom,
    getAllRoomsForAdmin,
    updateRoomStatus,
    setRoomFeatured,
    getOwnerStats,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getMyFavorites,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    reportRoom,
    getAdminReports,
    updateReportStatus,
    recordContactClick,
    isAdmin,
  };
})();
