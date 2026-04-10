(() => {
  const form = document.getElementById('profileForm');
  const messageNode = document.getElementById('profileMessage');
  const logoutBtn = document.getElementById('logoutBtn');
  const avatarUrlInput = document.getElementById('avatarUrl');
  const avatarPreviewContainer = document.getElementById('avatarPreviewContainer');
  const avatarPreview = document.getElementById('avatarPreview');

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const getCurrentUser = () => {
    return window.ApiService?.getCurrentUser?.();
  };

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

  const loadUserProfile = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      showMessage('Vui lòng đăng nhập để xem thông tin cá nhân.', 'error');
      setTimeout(redirectToLogin, 1500);
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
    } catch (error) {
      renderProfile(currentUser);
    }
  };

  const handleAvatarPreview = () => {
    if (!avatarUrlInput) return;

    avatarUrlInput.addEventListener('blur', () => {
      const url = avatarUrlInput.value.trim();
      if (url) {
        showAvatarPreview(url);
      }
    });

    avatarUrlInput.addEventListener('input', () => {
      const url = avatarUrlInput.value.trim();
      if (avatarPreviewContainer) {
        avatarPreviewContainer.hidden = !url;
      }
      if (avatarPreview && url) {
        avatarPreview.src = url;
      }
    });
  };

  const handleLogout = () => {
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.ApiService?.logout?.();
        window.location.href = 'index.html';
      });
    }
  };

  const init = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      showMessage('Vui lòng đăng nhập để xem thông tin cá nhân.', 'error');
      setTimeout(redirectToLogin, 1500);
      return;
    }

    handleAvatarPreview();
    handleLogout();

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const payload = {
          fullName: String(formData.get('fullName') || '').trim(),
          phone: String(formData.get('phone') || '').trim(),
          avatarUrl: String(formData.get('avatarUrl') || '').trim()
        };

        if (!payload.fullName) {
          showMessage('Vui lòng nhập họ và tên.', 'error');
          return;
        }

        if (!payload.phone) {
          showMessage('Vui lòng nhập số điện thoại.', 'error');
          return;
        }

        try {
          const updatedUser = await window.ApiService?.updateUserProfile?.(currentUser.id, payload);
          if (updatedUser) {
            showMessage('Cập nhật thông tin thành công!', 'success');
            renderProfile(updatedUser);
          }
        } catch (error) {
          showMessage(error.message || 'Không thể cập nhật thông tin.', 'error');
        }
      });
    }

    loadUserProfile();
  };

  init();
})();
