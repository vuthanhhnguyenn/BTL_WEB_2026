(() => {
  const messageNode = document.getElementById('authMessage');

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const initLogin = () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '').trim();

      try {
        await ApiService.login({ email, password });
        showMessage('Đăng nhập thành công. Đang chuyển về trang chủ...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 900);
      } catch (error) {
        showMessage(error.message || 'Đăng nhập thất bại.', 'error');
      }
    });
  };

  const initRegister = () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        fullName: String(formData.get('fullName') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        password: String(formData.get('password') || '').trim(),
        confirmPassword: String(formData.get('confirmPassword') || '').trim()
      };

      if (payload.password !== payload.confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp.', 'error');
        return;
      }

      try {
        await ApiService.register(payload);
        showMessage('Đăng ký thành công. Bạn có thể đăng nhập ngay.', 'success');
        form.reset();
      } catch (error) {
        showMessage(error.message || 'Đăng ký thất bại.', 'error');
      }
    });
  };

  initLogin();
  initRegister();
})();
