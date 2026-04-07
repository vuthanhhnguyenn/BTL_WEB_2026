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

  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
})();
