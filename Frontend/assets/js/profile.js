(() => {
  const form = document.getElementById('profileForm');
  const messageNode = document.getElementById('profileMessage');
  const avatarUrlInput = document.getElementById('avatarUrl');
  const avatarPreviewContainer = document.getElementById('avatarPreviewContainer');
  const avatarPreview = document.getElementById('avatarPreview');
  const favoritesGrid = document.getElementById('favoritesGrid');
  const savedSearchesList = document.getElementById('savedSearchesList');
  const profileHeroName = document.getElementById('profileHeroName');
  const profileHeroMeta = document.getElementById('profileHeroMeta');

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const getCurrentUser = () => window.ApiService?.getCurrentUser?.();

  const redirectToLogin = () => {
    window.location.href = 'login.html';
  };

  const renderProfile = (user) => {
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const roleInput = document.getElementById('role');

    if (fullNameInput) fullNameInput.value = user.fullName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (roleInput) roleInput.value = user.role || '';
    if (profileHeroName) profileHeroName.textContent = user.fullName || 'Tài khoản của bạn';
    if (profileHeroMeta) {
      profileHeroMeta.textContent = `${user.email || ''} ${user.phone ? `| ${user.phone}` : ''}`.trim();
    }

    if (avatarUrlInput && user.avatarUrl) {
      avatarUrlInput.value = user.avatarUrl;
      showAvatarPreview(user.avatarUrl);
    }
  };

  const showAvatarPreview = (url) => {
    if (!url || !avatarPreviewContainer || !avatarPreview) return;
    avatarPreviewContainer.hidden = false;
    avatarPreview.src = url;
  };

  const roomCardHtml = (room) => `
    <article class="card room-card zoom-hover">
      <div class="room-card-image-wrap">
        <img src="${room.images?.[0] || ''}" alt="${room.title}">
        ${room.featured ? '<div class="room-card-status"><span class="featured-pill">Nổi bật</span></div>' : ''}
      </div>
      <div class="room-card-body">
        <div class="room-card-topline">
          <span class="badge">${room.city || ''}</span>
          <span class="muted-note">${room.favoriteCount || 0} lượt lưu</span>
        </div>
        <h3>${room.title}</h3>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.district} | ${room.area}m2</div>
        <div class="room-card-actions">
          <a class="btn btn-primary" href="room-detail.html?id=${room.id}">Xem chi tiết</a>
        </div>
      </div>
    </article>
  `;

  const formatSavedSearchLink = (item) => {
    const params = new URLSearchParams();
    if (item.keyword) params.set('keyword', item.keyword);
    if (item.district) params.set('district', item.district);
    if (item.minPrice !== null && item.minPrice !== undefined) params.set('minPrice', item.minPrice);
    if (item.maxPrice !== null && item.maxPrice !== undefined) params.set('maxPrice', item.maxPrice);
    return `rooms.html?${params.toString()}`;
  };

  const renderFavorites = async () => {
    if (!favoritesGrid) return;
    favoritesGrid.innerHTML = '<p>Đang tải phòng yêu thích...</p>';
    try {
      const data = await window.ApiService?.getMyFavorites?.();
      const rooms = data?.content || [];
      if (!rooms.length) {
        favoritesGrid.innerHTML = '<p class="message">Bạn chưa lưu phòng nào.</p>';
        return;
      }
      favoritesGrid.innerHTML = rooms.map(roomCardHtml).join('');
    } catch (error) {
      favoritesGrid.innerHTML = `<p class="message error">${error.message || 'Không thể tải danh sách yêu thích.'}</p>`;
    }
  };

  const renderSavedSearches = async () => {
    if (!savedSearchesList) return;
    savedSearchesList.innerHTML = '<p>Đang tải bộ lọc...</p>';
    try {
      const items = await window.ApiService?.getSavedSearches?.();
      if (!items.length) {
        savedSearchesList.innerHTML = '<p class="message">Bạn chưa lưu bộ lọc nào.</p>';
        return;
      }

      savedSearchesList.innerHTML = items.map((item) => `
        <article class="stack-item">
          <div class="stack-item-head">
            <div>
              <strong>${item.name}</strong>
              <div class="stack-item-meta">${item.keyword || 'Không có từ khóa'} | ${item.district || 'Tất cả khu vực'}</div>
            </div>
            <button class="btn btn-danger-outline delete-saved-search-btn" type="button" data-id="${item.id}">Xóa</button>
          </div>
          <div class="stack-item-meta">Giá: ${item.minPrice ? ApiService.formatCurrency(item.minPrice) : '0'} - ${item.maxPrice ? ApiService.formatCurrency(item.maxPrice) : 'Không giới hạn'}</div>
          <div class="room-card-actions">
            <a class="btn btn-primary" href="${formatSavedSearchLink(item)}">Mở bộ lọc</a>
          </div>
        </article>
      `).join('');

      savedSearchesList.querySelectorAll('.delete-saved-search-btn').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await window.ApiService?.deleteSavedSearch?.(button.dataset.id);
            renderSavedSearches();
          } catch (error) {
            showMessage(error.message || 'Không thể xóa bộ lọc.', 'error');
          }
        });
      });
    } catch (error) {
      savedSearchesList.innerHTML = `<p class="message error">${error.message || 'Không thể tải bộ lọc đã lưu.'}</p>`;
    }
  };

  const loadUserProfile = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      showMessage('Vui lòng đăng nhập để xem thông tin cá nhân.', 'error');
      setTimeout(redirectToLogin, 1200);
      return;
    }

    try {
      const user = await window.ApiService?.getUserProfile?.(currentUser.id);
      if (user) {
        renderProfile(user);
        window.ApiService?.saveUser?.(user);
      } else {
        renderProfile(currentUser);
      }
    } catch {
      renderProfile(currentUser);
    }
  };

  const handleAvatarPreview = () => {
    if (!avatarUrlInput) return;
    avatarUrlInput.addEventListener('input', () => {
      const url = avatarUrlInput.value.trim();
      if (avatarPreviewContainer) avatarPreviewContainer.hidden = !url;
      if (avatarPreview && url) avatarPreview.src = url;
    });
  };

  const init = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      showMessage('Vui lòng đăng nhập để xem thông tin cá nhân.', 'error');
      setTimeout(redirectToLogin, 1200);
      return;
    }

    handleAvatarPreview();

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        fullName: String(formData.get('fullName') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        avatarUrl: String(formData.get('avatarUrl') || '').trim()
      };

      if (!payload.fullName || !payload.phone) {
        showMessage('Vui lòng nhập đầy đủ thông tin.', 'error');
        return;
      }

      try {
        const updatedUser = await window.ApiService?.updateUserProfile?.(currentUser.id, payload);
        showMessage('Cập nhật thông tin thành công!', 'success');
        renderProfile(updatedUser);
      } catch (error) {
        showMessage(error.message || 'Không thể cập nhật thông tin.', 'error');
      }
    });

    loadUserProfile();
    renderFavorites();
    renderSavedSearches();
  };

  init();
})();
