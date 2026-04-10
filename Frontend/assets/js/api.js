(() => {
  const { API_BASE_URL, USE_MOCK, STORAGE_KEYS } = window.AppConfig;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const getLocalRooms = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const setLocalRooms = (rooms) => localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

  const getAllMockRooms = () => [...window.DEMO_ROOMS, ...getLocalRooms()];

  const filterRooms = (rooms, params = {}) => {
    const keyword = (params.keyword || '').toLowerCase().trim();
    const district = (params.district || '').toLowerCase().trim();
    const minPrice = Number(params.minPrice || 0);
    const maxPrice = Number(params.maxPrice || 0);

    return rooms.filter((room) => {
      const matchesKeyword =
        !keyword ||
        room.title.toLowerCase().includes(keyword) ||
        room.address.toLowerCase().includes(keyword) ||
        room.city.toLowerCase().includes(keyword);
      const matchesDistrict = !district || room.district.toLowerCase().includes(district);
      const roomMin = Number(room.priceFrom || 0);
      const roomMax = Number(room.priceTo || room.priceFrom || 0);
      const matchesMin = !minPrice || roomMax >= minPrice;
      const matchesMax = !maxPrice || roomMin <= maxPrice;

      return matchesKeyword && matchesDistrict && matchesMin && matchesMax;
    });
  };

  const request = async (path, options = {}) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers = {
      ...(options.rawBody ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      ...(options.auth && token ? { Authorization: `Bearer ${token}` } : {})
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body
    });

    if (!response.ok) {
      const text = await response.text();
      let message = text || 'Không thể kết nối API backend.';

      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch {
        // Keep raw text when backend does not return JSON.
      }

      throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  const getRooms = async (params = {}) => {
    if (USE_MOCK) {
      const rooms = filterRooms(getAllMockRooms(), params);
      return { content: rooms, totalElements: rooms.length };
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    return request(`/rooms/search?${query.toString()}`);
  };

  const getInitialRooms = async (limit = 5) => {
    if (USE_MOCK) {
      const rooms = getAllMockRooms()
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id))
        .slice(0, limit);
      return { content: rooms, totalElements: rooms.length };
    }
    return request(`/rooms/initial?limit=${Number(limit) || 5}`);
  };

  const getRoomById = async (id) => {
    if (USE_MOCK) {
      return getAllMockRooms().find((room) => Number(room.id) === Number(id)) || null;
    }
    return request(`/rooms/${id}`);
  };

  const login = async ({ email, password }) => {
    if (USE_MOCK) {
      if (!email || !password) throw new Error('Email và mật khẩu là bắt buộc.');
      const data = {
        token: 'mock-jwt-token',
        user: { id: 1, fullName: 'Người dùng demo', email, role: 'USER' }
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      return data;
    }

    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const user = data.user || {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      avatarUrl: data.avatarUrl
    };

    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return data;
  };

  const register = async (payload) => {
    if (USE_MOCK) {
      return { success: true, message: 'Đăng ký thành công (mock).' };
    }
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  };

  const createListing = async (roomPayload, imageFiles = []) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const ids = getAllMockRooms().map((room) => Number(room.id) || 0);
      const nextId = (Math.max(...ids, 0) || 0) + 1;

      const previewImages = imageFiles.length
        ? imageFiles.map((file) => URL.createObjectURL(file))
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

      const newRoom = {
        ...roomPayload,
        id: nextId,
        images: previewImages
      };
      localRooms.push(newRoom);
      setLocalRooms(localRooms);
      return newRoom;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(roomPayload)], { type: 'application/json' }));
    imageFiles.forEach((file) => formData.append('images', file));

    return request('/rooms', {
      method: 'POST',
      body: formData,
      auth: true,
      rawBody: true
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    } catch {
      return null;
    }
  };

  const saveUser = (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  };

  const getUserProfile = async (id) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === id) {
        return currentUser;
      }
      throw new Error('User not found');
    }
    return request(`/users/${id}`, { auth: true });
  };

  const updateUserProfile = async (id, payload) => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === id) {
        const updatedUser = { ...currentUser, ...payload };
        saveUser(updatedUser);
        return updatedUser;
      }
      throw new Error('User not found');
    }
    const updatedUser = await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      auth: true
    });
    if (updatedUser) {
      saveUser(updatedUser);
    }
    return updatedUser;
  };

  const getFirst12RoomIds = async () => {
  if (USE_MOCK) {
    return getAllMockRooms()
      .map((room) => Number(room.id))
      .sort((a, b) => a - b)
      .slice(0, 12);
  }
  return request('/rooms/ids/first-12');
};

  const getMyRooms = async () => {
    if (USE_MOCK) {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return { content: [], totalElements: 0 };
      }
      const localRooms = getLocalRooms().filter(room => room.userId === currentUser.id);
      return { content: localRooms, totalElements: localRooms.length };
    }
    return request('/rooms/my', { auth: true });
  };

  const updateRoom = async (id, roomPayload, imageFiles = []) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms();
      const index = localRooms.findIndex(room => Number(room.id) === Number(id));
      if (index === -1) throw new Error('Room not found');

      const previewImages = imageFiles.length
        ? imageFiles.map((file) => URL.createObjectURL(file))
        : localRooms[index].images || [];

      const updatedRoom = {
        ...localRooms[index],
        ...roomPayload,
        images: previewImages
      };
      localRooms[index] = updatedRoom;
      setLocalRooms(localRooms);
      return updatedRoom;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(roomPayload)], { type: 'application/json' }));
    if (imageFiles && imageFiles.length) {
      imageFiles.forEach((file) => formData.append('images', file));
    }

    return request(`/rooms/${id}`, {
      method: 'PUT',
      body: formData,
      auth: true,
      rawBody: true
    });
  };

  const deleteRoom = async (id) => {
    if (USE_MOCK) {
      const localRooms = getLocalRooms().filter(room => Number(room.id) !== Number(id));
      setLocalRooms(localRooms);
      return true;
    }
    return request(`/rooms/${id}`, { method: 'DELETE', auth: true });
  };

  window.ApiService = {
    formatCurrency,
    getInitialRooms,
    getRooms,
    getRoomById,
    getFirst12RoomIds,
    login,
    register,
    createListing,
    logout,
    getCurrentUser,
    saveUser,
    getUserProfile,
    updateUserProfile,
    getMyRooms,
    updateRoom,
    deleteRoom
  };
})();
