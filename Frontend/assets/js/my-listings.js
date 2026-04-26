(() => {
  const listNode = document.getElementById('listingsGrid');
  const resultInfo = document.getElementById('resultInfo');
  const postedMessage = document.getElementById('postedMessage');
  const params = new URLSearchParams(window.location.search);
  const confirmModal = document.getElementById('confirmModal');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const confirmDeleteBtn = document.getElementById('confirmDelete');

  const statTotalRooms = document.getElementById('statTotalRooms');
  const statFeaturedRooms = document.getElementById('statFeaturedRooms');
  const statTotalViews = document.getElementById('statTotalViews');
  const statContactClicks = document.getElementById('statContactClicks');
  const statFavoriteCount = document.getElementById('statFavoriteCount');

  let pendingDeleteId = null;

  const getCurrentUser = () => window.ApiService?.getCurrentUser?.();

  const showPostedMessage = () => {
    if (!postedMessage) return;
    if (params.get('posted') !== '1') return;
    postedMessage.className = 'message success';
    postedMessage.textContent = 'Bài viết của bạn đã được đăng tải, đợi admin kiểm duyệt.';
    postedMessage.hidden = false;
    window.history.replaceState({}, document.title, 'my-listings.html');
  };

  const restorePostedMessage = () => {
    if (!postedMessage) return;
    const message = sessionStorage.getItem('troxinh_post_room_success');
    if (!message) return;

    sessionStorage.removeItem('troxinh_post_room_success');
    postedMessage.className = 'message success';
    postedMessage.textContent = message;
    postedMessage.hidden = false;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: { text: 'Còn trống', class: 'badge-success' },
      RENTED: { text: 'Đã thuê', class: 'badge-warning' },
      EXPIRED: { text: 'Hết hạn', class: 'badge-danger' },
      PENDING: { text: 'Chờ duyệt', class: 'badge-warning' },
      APPROVED: { text: 'Đã duyệt', class: 'badge-success' },
      REJECTED: { text: 'Từ chối', class: 'badge-danger' }
    };

    const config = statusMap[String(status || '').toUpperCase()] || {
      text: status || 'Không rõ',
      class: ''
    };

    return `<span class="badge ${config.class}">${config.text}</span>`;
  };

  const listingCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter" data-room-id="${room.id}">
      <div class="room-card-image-wrap">
        <img src="${room.images[0]}" alt="${room.title}">
        <div class="room-card-status">${room.featured ? '<span class="featured-pill">Nổi bật</span>' : getStatusBadge(room.status)}</div>
      </div>
      <div class="room-card-body">
        <div class="room-card-topline">
          <h3>${room.title}</h3>
          <button class="btn btn-outline featured-toggle-btn" type="button" data-id="${room.id}" data-featured="${room.featured ? 'true' : 'false'}">
            ${room.featured ? 'Tắt nổi bật' : 'Bật nổi bật'}
          </button>
        </div>
        <div class="room-meta">${room.address}</div>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="mini-stats">
          <div class="mini-stat"><strong>${room.viewCount || 0}</strong><span>Lượt xem</span></div>
          <div class="mini-stat"><strong>${room.contactClickCount || 0}</strong><span>Liên hệ</span></div>
          <div class="mini-stat"><strong>${room.favoriteCount || 0}</strong><span>Yêu thích</span></div>
        </div>
        <div class="room-card-actions">
          <a class="btn btn-outline" href="room-detail.html?id=${room.id}">Xem</a>
          <a class="btn btn-primary" href="edit-room.html?id=${room.id}">Sửa</a>
          <button class="btn btn-danger-outline delete-btn" data-id="${room.id}">Xóa</button>
        </div>
      </div>
    </article>
  `;

  const showModal = () => {
    if (confirmModal) confirmModal.hidden = false;
  };

  const hideModal = () => {
    if (confirmModal) confirmModal.hidden = true;
    pendingDeleteId = null;
  };

  const renderStats = async () => {
    try {
      const stats = await ApiService.getOwnerStats();
      if (statTotalRooms) statTotalRooms.textContent = String(stats.totalRooms || 0);
      if (statFeaturedRooms) statFeaturedRooms.textContent = String(stats.featuredRooms || 0);
      if (statTotalViews) statTotalViews.textContent = String(stats.totalViews || 0);
      if (statContactClicks) statContactClicks.textContent = String(stats.totalContactClicks || 0);
      if (statFavoriteCount) statFavoriteCount.textContent = String(stats.totalFavorites || 0);
    } catch {
      // Keep stats as-is if loading fails.
    }
  };

  const createDeleteOverlay = () => {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-card" role="status" aria-live="polite">
        <div class="loading-spinner"></div>
        <strong>Đang xóa bài viết</strong>
        <span>Vui lòng chờ...</span>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
    return loadingOverlay;
  };

  const handleDelete = async (id) => {
    const loadingOverlay = createDeleteOverlay();

    try {
      await window.ApiService?.deleteRoom?.(id);
      hideModal();

      const card = listNode?.querySelector(`[data-room-id="${id}"]`);
      if (card) {
        card.remove();
      }

      await renderStats();
      await renderListings();
    } catch (error) {
      hideModal();
      if (resultInfo) {
        resultInfo.innerHTML = `<span class="message error">${error.message || 'Không thể xóa tin này.'}</span>`;
      }
    } finally {
      loadingOverlay.remove();
    }
  };

  const bindCardActions = () => {
    listNode?.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        pendingDeleteId = btn.dataset.id;
        showModal();
      });
    });

    listNode?.querySelectorAll('.featured-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const featured = btn.dataset.featured !== 'true';
          await ApiService.setRoomFeatured(btn.dataset.id, featured);
          await renderListings();
          await renderStats();
        } catch (error) {
          if (resultInfo) {
            resultInfo.innerHTML = `<span class="message error">${error.message || 'Không thể cập nhật gói nổi bật.'}</span>`;
          }
        }
      });
    });
  };

  const renderListings = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      if (listNode) {
        listNode.innerHTML = '<p class="message error">Vui lòng đăng nhập để xem tin đã đăng.</p>';
      }
      return;
    }

    if (!listNode) return;
    listNode.innerHTML = '<p>Đang tải dữ liệu...</p>';

    try {
      const data = await window.ApiService?.getMyRooms?.();
      const rooms = data?.content || [];
      const total = Number(data?.totalElements || rooms.length);

      if (resultInfo) {
        resultInfo.textContent = total > 0 ? `Bạn đang có ${total} tin đăng.` : 'Bạn chưa có tin đăng nào.';
      }

      if (!rooms.length) {
        listNode.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
            <p class="section-subtitle">Bạn chưa có tin đăng nào.</p>
            <a class="btn btn-primary" href="post-room.html">Đăng tin ngay</a>
          </div>
        `;
        return;
      }

      listNode.innerHTML = rooms.map((room) => listingCardHtml(room)).join('');
      bindCardActions();
    } catch (error) {
      listNode.innerHTML = `<p class="message error">${error.message || 'Không thể tải danh sách tin.'}</p>`;
    }
  };

  const init = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      if (listNode) {
        listNode.innerHTML = '<p class="message error">Vui lòng đăng nhập để xem tin đã đăng.</p>';
      }
      return;
    }

    showPostedMessage();
    restorePostedMessage();

    cancelDeleteBtn?.addEventListener('click', hideModal);
    confirmDeleteBtn?.addEventListener('click', () => {
      if (pendingDeleteId) handleDelete(pendingDeleteId);
    });
    confirmModal?.addEventListener('click', (event) => {
      if (event.target === confirmModal) hideModal();
    });

    renderStats();
    renderListings();
  };

  init();
})();
