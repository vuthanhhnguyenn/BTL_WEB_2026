(() => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const navMap = {
    'index.html': 'nav-home',
    'rooms.html': 'nav-rooms',
    'post-room.html': 'nav-post',
    'my-listings.html': 'nav-my-listings',
    'admin.html': 'nav-admin',
    'admin-reports.html': 'nav-admin',
    'edit-room.html': 'nav-my-listings',
    'about.html': 'nav-about',
    'login.html': 'nav-login',
    'register.html': 'nav-login',
    'profile.html': 'nav-profile',
    'change-password.html': 'nav-profile',
    'room-detail.html': 'nav-rooms'
  };

  const activeId = navMap[path];
  const activeLink = activeId ? document.getElementById(activeId) : null;
  if (activeLink) activeLink.classList.add('active');

  const headerInner = document.querySelector('.header-inner');
  const nav = document.querySelector('.nav');
  const loginLink = document.getElementById('nav-login');
  const profileLink = document.getElementById('nav-profile');
  const currentUser = window.ApiService?.getCurrentUser?.();

  const ensureNavLink = (id, href, text) => {
    if (!nav) return null;
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('a');
      link.id = id;
      link.href = href;
      link.textContent = text;
      nav.appendChild(link);
    }
    return link;
  };

  const closeMenusOnOutsideClick = (menu, trigger) => {
    document.addEventListener('click', (event) => {
      if (!menu || !trigger) return;
      if (menu.hidden) return;
      if (menu.contains(event.target) || trigger.contains(event.target)) return;
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });
  };

  if (currentUser) {
    if (loginLink) loginLink.hidden = true;
    if (profileLink) profileLink.hidden = true;

    const myListingsLink = ensureNavLink('nav-my-listings', 'my-listings.html', 'Tin của tôi');
    if (myListingsLink) myListingsLink.hidden = false;

    if (String(currentUser.role || '').toUpperCase() === 'ADMIN') {
      const adminLink = ensureNavLink('nav-admin', 'admin.html', 'Quản trị');
      if (adminLink) adminLink.hidden = false;
    }

    if (headerInner && !document.querySelector('.header-actions')) {
      const headerActions = document.createElement('div');
      headerActions.className = 'header-actions';
      const profileMenu = document.createElement('div');
      profileMenu.className = 'profile-menu';
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'profile-trigger';
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      const initials = String(currentUser.fullName || currentUser.email || 'TK')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2) || 'TK';

      trigger.innerHTML = `
        <span class="profile-avatar">${initials}</span>
        <span class="profile-trigger-copy">
          <strong>${currentUser.fullName || 'Tài khoản'}</strong>
          <small>${String(currentUser.role || 'USER').toUpperCase()}</small>
        </span>
      `;

      const dropdown = document.createElement('div');
      dropdown.className = 'profile-dropdown';
      dropdown.hidden = true;

      const links = [
        { href: 'profile.html', text: 'Thông tin cá nhân' },
        { href: 'change-password.html', text: 'Đổi mật khẩu' },
        { href: 'my-listings.html', text: 'Tin của tôi' }
      ];

      if (String(currentUser.role || '').toUpperCase() === 'ADMIN') {
        links.push({ href: 'admin.html', text: 'Quản trị bài đăng' });
        links.push({ href: 'admin-reports.html', text: 'Báo cáo bài viết' });
      }

      dropdown.innerHTML = `
        <div class="profile-dropdown-head">
          <strong>${currentUser.fullName || 'Tài khoản'}</strong>
          <span>${currentUser.email || ''}</span>
        </div>
        <div class="profile-dropdown-links">
          ${links.map((item) => `<a href="${item.href}">${item.text}</a>`).join('')}
        </div>
        <button class="profile-logout-btn" type="button">Đăng xuất</button>
      `;

      trigger.addEventListener('click', () => {
        const nextHidden = !dropdown.hidden;
        dropdown.hidden = nextHidden;
        trigger.setAttribute('aria-expanded', String(!nextHidden));
      });

      dropdown.querySelector('.profile-logout-btn')?.addEventListener('click', () => {
        window.ApiService?.logout?.();
        window.location.href = 'index.html';
      });

      closeMenusOnOutsideClick(dropdown, trigger);
      profileMenu.appendChild(trigger);
      profileMenu.appendChild(dropdown);
      headerActions.appendChild(profileMenu);
      headerInner.appendChild(headerActions);
    }
  } else {
    if (loginLink) {
      loginLink.hidden = false;
      loginLink.textContent = 'Đăng nhập';
      loginLink.href = 'login.html';
    }
    if (profileLink) profileLink.hidden = true;
    const adminLink = document.getElementById('nav-admin');
    if (adminLink) adminLink.hidden = true;
  }

  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
})();
