(() => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const navMap = {
    'index.html': 'nav-home',
    'rooms.html': 'nav-rooms',
    'post-room.html': 'nav-post',
    'my-listings.html': 'nav-my-listings',
    'edit-room.html': 'nav-my-listings',
    'about.html': 'nav-about',
    'login.html': 'nav-login',
    'register.html': 'nav-login',
    'profile.html': 'nav-profile',
    'room-detail.html': 'nav-rooms'
  };

  const activeId = navMap[path];
  const activeLink = activeId ? document.getElementById(activeId) : null;
  if (activeLink) activeLink.classList.add('active');

  const loginLink = document.getElementById('nav-login');
  const profileLink = document.getElementById('nav-profile');
  const currentUser = window.ApiService?.getCurrentUser?.();

  if (currentUser) {
    if (loginLink) {
      loginLink.hidden = true;
    }
    if (profileLink) {
      profileLink.hidden = false;
      profileLink.textContent = currentUser.fullName || 'Tài khoản';
    }
    const myListingsLink = document.getElementById('nav-my-listings');
    if (myListingsLink) {
      myListingsLink.hidden = false;
    }
  } else {
    if (loginLink) {
      loginLink.hidden = false;
      loginLink.textContent = '\u0110\u0103ng nh\u1eadp';
      loginLink.href = 'login.html';
    }
    if (profileLink) {
      profileLink.hidden = true;
    }
  }

  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
})();

