(() => {
  const AppConfig = {
    API_BASE_URL: 'http://localhost:4000/api/v1',
    //API_BASE_URL: 'https://btl-web-2026.onrender.com/api/v1',

    USE_MOCK: false,
    STORAGE_KEYS: {
      TOKEN: "troxinh_token",
      USER: "troxinh_user",
      ROOMS: "troxinh_rooms_local",
      FAVORITES: "troxinh_favorites_local",
      SAVED_SEARCHES: "troxinh_saved_searches_local",
      REPORTS: "troxinh_reports_local"
    },
  };

  window.AppConfig = AppConfig;
})();
