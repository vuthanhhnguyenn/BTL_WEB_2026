(() => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const navMap = {
    'index.html': 'nav-home',
    'rooms.html': 'nav-rooms',
    'post-room.html': 'nav-post',
    'about.html': 'nav-about',
    'login.html': 'nav-login',
    'register.html': 'nav-login',
    'room-detail.html': 'nav-rooms'
  };

  const activeId = navMap[path];
  const activeLink = activeId ? document.getElementById(activeId) : null;
  if (activeLink) activeLink.classList.add('active');

  const loginLink = document.getElementById('nav-login');
  const currentUser = window.ApiService?.getCurrentUser?.();

  if (loginLink) {
    if (currentUser) {
      loginLink.textContent = '\u0110\u0103ng xu\u1ea5t';
      loginLink.href = '#';
      loginLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.ApiService?.logout?.();
        window.location.href = 'index.html';
      });
    } else {
      loginLink.textContent = '\u0110\u0103ng nh\u1eadp';
      loginLink.href = 'login.html';
    }
  }

  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
})();

