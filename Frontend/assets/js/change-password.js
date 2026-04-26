(() => {
  const form = document.getElementById('changePasswordForm');
  const messageNode = document.getElementById('passwordMessage');

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const currentUser = window.ApiService?.getCurrentUser?.();

  if (!currentUser || !currentUser.id) {
    window.location.href = 'login.html';
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const oldPassword = String(formData.get('oldPassword') || '').trim();
    const newPassword = String(formData.get('newPassword') || '').trim();
    const confirmPassword = String(formData.get('confirmPassword') || '').trim();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showMessage('Vui lòng nhập đầy đủ thông tin.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Xác nhận mật khẩu mới chưa khớp.', 'error');
      return;
    }

    try {
      await window.ApiService?.changePassword?.(currentUser.id, oldPassword, newPassword);
      showMessage('Đổi mật khẩu thành công!', 'success');
      form.reset();
    } catch (error) {
      showMessage(error.message || 'Không thể đổi mật khẩu.', 'error');
    }
  });
})();
