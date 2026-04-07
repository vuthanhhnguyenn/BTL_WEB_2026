(() => {
  const searchForm = document.getElementById('homeSearchForm');
  const featuredGrid = document.getElementById('featuredGrid');

  const roomCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter">
      <img src="${room.images[0]}" alt="${room.title}">
      <div class="room-card-body">
        <span class="badge">${room.city}</span>
        <h3>${room.title}</h3>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.area}m2 | ${room.district}</div>
        <a class="btn btn-outline" href="room-detail.html?id=${room.id}">Xem chi tiết</a>
      </div>
    </article>
  `;

  const renderFeatured = async () => {
    if (!featuredGrid) return;
    const ids = await ApiService.getFirst12RoomIds();

    const detailResults = await Promise.allSettled(
    ids.map((id) => ApiService.getRoomById(id))
  );

  const rooms = detailResults
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
    featuredGrid.innerHTML = rooms.map(roomCardHtml).join('');
  };

  const initSearch = () => {
    if (!searchForm) return;
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(searchForm);
      const params = new URLSearchParams();
      ['keyword', 'district', 'minPrice', 'maxPrice'].forEach((key) => {
        const value = String(formData.get(key) || '').trim();
        if (value) params.set(key, value);
      });
      window.location.href = `rooms.html?${params.toString()}`;
    });
  };

  renderFeatured().catch((error) => {
    if (featuredGrid) {
      featuredGrid.innerHTML = `<p class="message error">${error.message}</p>`;
    }
  });

  initSearch();
})();
