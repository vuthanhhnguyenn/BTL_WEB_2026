(() => {
  const listNode = document.getElementById('listingsGrid');
  const resultInfo = document.getElementById('resultInfo');
  const confirmModal = document.getElementById('confirmModal');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const confirmDeleteBtn = document.getElementById('confirmDelete');

  let pendingDeleteId = null;

  const getCurrentUser = () => {
    return window.ApiService?.getCurrentUser?.();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'AVAILABLE': { text: 'Còn trống', class: 'badge-success' },
      'RENTED': { text: 'Đã thuê', class: 'badge-warning' },
      'EXPIRED': { text: 'Hết hạn', class: 'badge-danger' }
    };
    const config = statusMap[status] || { text: status || 'Không rõ', class: '' };
    return `<span class="badge ${config.class}">${config.text}</span>`;
  };

  const listingCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter">
      <div class="room-card-image-wrap">
        <img src="${room.images[0]}" alt="${room.title}">
        <div class="room-card-status">${getStatusBadge(room.status)}</div>
      </div>
      <div class="room-card-body">
        <h3>${room.title}</h3>
        <div class="room-meta">${room.address}</div>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.area}m2 | ${room.bedrooms} PN | ${room.bathrooms} WC</div>
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

  const handleDelete = async (id) => {
    try {
      await window.ApiService?.deleteRoom?.(id);
      hideModal();
      renderListings();
    } catch (error) {
      hideModal();
      if (resultInfo) {
        resultInfo.innerHTML = `<span class="message error">${error.message || 'Không thể xóa tin này.'}</span>`;
      }
    }
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
        resultInfo.textContent = total > 0
          ? `Bạn đang có ${total} tin đăng.`
          : 'Bạn chưa có tin đăng nào.';
      }

      if (!rooms.length) {
        listNode.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
            <p class="section-subtitle">Bạn chưa có tin đăng nào.</p>
            <br>
            <a class="btn btn-primary" href="post-room.html">Đăng tin ngay</a>
          </div>
        `;
        return;
      }

      listNode.innerHTML = rooms.map(room => listingCardHtml(room)).join('');

      listNode.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          pendingDeleteId = btn.dataset.id;
          showModal();
        });
      });
    } catch (error) {
      if (listNode) {
        listNode.innerHTML = `<p class="message error">${error.message || 'Không thể tải danh sách tin.'}</p>`;
      }
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

    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', hideModal);
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (pendingDeleteId) {
          handleDelete(pendingDeleteId);
        }
      });
    }

    if (confirmModal) {
      confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
          hideModal();
        }
      });
    }

    renderListings();
  };

  init();
})();
