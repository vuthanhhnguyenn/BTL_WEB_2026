(() => {
  const featuredGrid = document.getElementById('featuredGrid');

  const roomCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter">
      <div class="room-card-image-wrap">
        <img src="${room.images[0]}" alt="${room.title}">
        ${room.featured ? '<div class="room-card-status"><span class="featured-pill">Nổi bật</span></div>' : ''}
      </div>
      <div class="room-card-body">
        <div class="room-card-topline">
          <span class="badge">${room.city}</span>
          <span class="muted-note">${room.viewCount || 0} lượt xem</span>
        </div>
        <h3>${room.title}</h3>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.area}m2 | ${room.district}</div>
        <div class="room-card-actions">
          <a class="btn btn-primary" href="room-detail.html?id=${room.id}">Xem chi tiết phòng</a>
        </div>
      </div>
    </article>
  `;

  const renderFeatured = async () => {
    if (!featuredGrid) return;
    const data = await ApiService.getFeaturedRooms(12);
    const rooms = data?.content || [];
    if (!rooms.length) {
      featuredGrid.innerHTML = '<p class="message">Chưa có phòng nổi bật nào.</p>';
      return;
    }
    featuredGrid.innerHTML = rooms.map(roomCardHtml).join('');
  };

  renderFeatured().catch((error) => {
    if (featuredGrid) {
      featuredGrid.innerHTML = `<p class="message error">${error.message}</p>`;
    }
  });
})();
