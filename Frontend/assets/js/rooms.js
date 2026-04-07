(() => {
  const DEFAULT_VISIBLE_LIMIT = 5;
  const listNode = document.getElementById('roomsGrid');
  const resultInfo = document.getElementById('resultInfo');
  const filterForm = document.getElementById('roomFilterForm');

  const toQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      keyword: params.get('keyword') || '',
      district: params.get('district') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || ''
    };
  };

  const applyQueryToForm = () => {
    if (!filterForm) return;
    const q = toQueryParams();
    Object.keys(q).forEach((key) => {
      if (filterForm.elements[key]) {
        filterForm.elements[key].value = q[key];
      }
    });
  };

  const roomCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter">
      <img src="${room.images[0]}" alt="${room.title}">
      <div class="room-card-body">
        <span class="badge">${room.city}</span>
        <h3>${room.title}</h3>
        <div class="room-meta">${room.address}</div>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.area}m2 | ${room.bedrooms} PN | ${room.bathrooms} WC</div>
        <a class="btn btn-primary" href="room-detail.html?id=${room.id}">Xem chi tiết phòng</a>
      </div>
    </article>
  `;

  const hasActiveFilters = (params = {}) =>
    ['keyword', 'district', 'minPrice', 'maxPrice'].some(
      (key) => String(params[key] || '').trim() !== ''
    );

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
          : `Hãy dùng bộ lọc để tìm thêm.`;
      }

      if (!rooms.length) {
        listNode.innerHTML = '<p class="message error">Không có phòng phù hợp, bạn hãy đổi điều kiện tìm kiếm.</p>';
        return;
      }

      listNode.innerHTML = rooms.map(roomCardHtml).join('');
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

  applyQueryToForm();
  initFilterForm();
  renderRooms(toQueryParams());
})();
