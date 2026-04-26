(() => {
  const DEFAULT_VISIBLE_LIMIT = 5;
  const listNode = document.getElementById('roomsGrid');
  const resultInfo = document.getElementById('resultInfo');
  const filterForm = document.getElementById('roomFilterForm');
  const saveSearchBtn = document.getElementById('saveSearchBtn');
  const saveSearchMessage = document.getElementById('saveSearchMessage');

  const getCurrentParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      keyword: params.get('keyword') || '',
      district: params.get('district') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || ''
    };
  };

  const showSaveMessage = (message, type = 'success') => {
    if (!saveSearchMessage) return;
    saveSearchMessage.hidden = false;
    saveSearchMessage.className = `message ${type}`;
    saveSearchMessage.textContent = message;
  };

  const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} vnđ`;

  const initPriceSliders = () => {
    const minSlider = document.getElementById('minPriceSlider');
    const minInput = document.getElementById('minPrice');
    const minDisplay = document.getElementById('minPriceDisplay');
    const maxSlider = document.getElementById('maxPriceSlider');
    const maxInput = document.getElementById('maxPrice');
    const maxDisplay = document.getElementById('maxPriceDisplay');

    if (minSlider && minInput && minDisplay) {
      minSlider.addEventListener('input', () => {
        minInput.value = minSlider.value;
        minDisplay.textContent = formatPrice(minSlider.value);
      });
      minInput.addEventListener('input', () => {
        minSlider.value = minInput.value;
        minDisplay.textContent = formatPrice(minInput.value);
      });
    }

    if (maxSlider && maxInput && maxDisplay) {
      maxSlider.addEventListener('input', () => {
        maxInput.value = maxSlider.value;
        maxDisplay.textContent = formatPrice(maxSlider.value);
      });
      maxInput.addEventListener('input', () => {
        maxSlider.value = maxInput.value;
        maxDisplay.textContent = formatPrice(maxInput.value);
      });
    }
  };

  const applyQueryToForm = () => {
    if (!filterForm) return;
    const q = getCurrentParams();
    Object.keys(q).forEach((key) => {
      if (filterForm.elements[key]) filterForm.elements[key].value = q[key];
    });

    const minSlider = document.getElementById('minPriceSlider');
    const minDisplay = document.getElementById('minPriceDisplay');
    const maxSlider = document.getElementById('maxPriceSlider');
    const maxDisplay = document.getElementById('maxPriceDisplay');

    if (q.minPrice) {
      if (minSlider) minSlider.value = q.minPrice;
      if (minDisplay) minDisplay.textContent = formatPrice(q.minPrice);
    }
    if (q.maxPrice) {
      if (maxSlider) maxSlider.value = q.maxPrice;
      if (maxDisplay) maxDisplay.textContent = formatPrice(q.maxPrice);
    }
  };

  const roomCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter">
      <div class="room-card-image-wrap">
        <img src="${room.images[0]}" alt="${room.title}">
          ${room.featured ? '<div class="room-card-status"><span class="featured-pill">Nổi bật</span></div>' : ''}
      </div>
      <div class="room-card-body">
        <div class="room-card-topline">
          <span class="badge">${room.city}</span>
            <button class="btn btn-outline favorite-btn" type="button" data-id="${room.id}" data-favorited="${room.favorited ? 'true' : 'false'}">
              ${room.favorited ? 'Bỏ lưu' : 'Yêu thích'}
            </button>
        </div>
        <h3>${room.title}</h3>
        <div class="room-meta">${room.address}</div>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.area}m2 | ${room.bedrooms} PN | ${room.bathrooms} WC</div>
          <div class="room-meta">${room.viewCount || 0} lượt xem | ${room.favoriteCount || 0} lượt lưu</div>
        <div class="room-card-actions">
            <a class="btn btn-primary" href="room-detail.html?id=${room.id}">Xem chi tiết</a>
        </div>
      </div>
    </article>
  `;

  const hasActiveFilters = (params = {}) =>
    ['keyword', 'district', 'minPrice', 'maxPrice'].some((key) => String(params[key] || '').trim() !== '');

  const bindFavoriteActions = () => {
    listNode?.querySelectorAll('.favorite-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!ApiService.getCurrentUser()) {
          showSaveMessage('Vui lòng đăng nhập để lưu phòng.', 'error');
          return;
        }
        const shouldFavorite = button.dataset.favorited !== 'true';
        try {
          await ApiService.toggleFavorite(button.dataset.id, shouldFavorite);
          renderRooms(getCurrentParams());
        } catch (error) {
          showSaveMessage(error.message || 'Không thể cập nhật yêu thích.', 'error');
        }
      });
    });
  };

  const renderRooms = async (params) => {
    if (!listNode) return;
    listNode.innerHTML = '<p>Đang tải dữ liệu phòng...</p>';

    try {
      const usingFilters = hasActiveFilters(params);
      const data = usingFilters
        ? await ApiService.getRooms(params)
        : await ApiService.getInitialRooms(DEFAULT_VISIBLE_LIMIT);
      const rooms = data.content || [];
      const total = Number(data.totalElements || rooms.length);

      if (resultInfo) {
        resultInfo.textContent = usingFilters
          ? `Tìm thấy ${total} phòng phù hợp`
          : `Danh sách mặc định — ưu tiên tin nổi bật và bài đăng được quan tâm.`;
      }

      if (!rooms.length) {
        listNode.innerHTML = '<p class="message error">Không có phòng phù hợp, bạn hãy đổi điều kiện tìm kiếm.</p>';
        return;
      }

      listNode.innerHTML = rooms.map(roomCardHtml).join('');
      bindFavoriteActions();
    } catch (error) {
      listNode.innerHTML = `<p class="message error">${error.message}</p>`;
    }
  };

  const initFilterForm = () => {
    if (!filterForm) return;

    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(filterForm);
      const params = new URLSearchParams();
      ['keyword', 'district', 'minPrice', 'maxPrice'].forEach((key) => {
        const value = String(formData.get(key) || '').trim();
        if (value) params.set(key, value);
      });
      window.history.replaceState({}, '', `rooms.html?${params.toString()}`);
      renderRooms(Object.fromEntries(params.entries()));
    });
  };

  const initSaveSearch = () => {
    if (!saveSearchBtn) return;
    saveSearchBtn.addEventListener('click', async () => {
      const currentUser = ApiService.getCurrentUser();
      if (!currentUser) {
        showSaveMessage('Vui lòng đăng nhập để lưu bộ lọc.', 'error');
        return;
      }

      const params = getCurrentParams();
      if (!hasActiveFilters(params)) {
        showSaveMessage('Hãy chọn ít nhất một điều kiện trước khi lưu.', 'error');
        return;
      }

      try {
        await ApiService.saveSearch({
          name: `Bộ lọc ${params.district || params.keyword || 'phòng trọ'}`,
          keyword: params.keyword || null,
          district: params.district || null,
          minPrice: params.minPrice ? Number(params.minPrice) : null,
          maxPrice: params.maxPrice ? Number(params.maxPrice) : null
        });
        showSaveMessage('Đã lưu bộ lọc tìm kiếm.', 'success');
      } catch (error) {
        showSaveMessage(error.message || 'Không thể lưu bộ lọc.', 'error');
      }
    });
  };

  initPriceSliders();
  applyQueryToForm();
  initFilterForm();
  initSaveSearch();
  renderRooms(getCurrentParams());
})();
