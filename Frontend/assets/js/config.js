(() => {
  const AppConfig = {
    API_BASE_URL: 'http://localhost:8080/api/v1',
    USE_MOCK: true,
    STORAGE_KEYS: {
      TOKEN: 'troxinh_token',
      USER: 'troxinh_user',
      ROOMS: 'troxinh_rooms_local'
    }
  };

  window.AppConfig = AppConfig;
})();
