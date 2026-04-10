(() => {
  const form = document.getElementById('editRoomForm');
  const messageNode = document.getElementById('editMessage');
  const newImagePreview = document.getElementById('newImagePreview');
  const currentImagesContainer = document.getElementById('currentImagesContainer');
  const currentImagesDiv = document.getElementById('currentImages');

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('id');

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

  const redirectToMyListings = () => {
    window.location.href = 'my-listings.html';
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' vnđ';
  };

  const initPriceSlider = () => {
    const priceFromSlider = document.getElementById('priceFromSlider');
    const priceFromInput = document.getElementById('priceFrom');
    const priceFromDisplay = document.getElementById('priceFromDisplay');
    const priceToSlider = document.getElementById('priceToSlider');
    const priceToInput = document.getElementById('priceTo');
    const priceToDisplay = document.getElementById('priceToDisplay');

    if (priceFromSlider && priceFromInput && priceFromDisplay) {
      const syncSliderToInput = () => {
        priceFromInput.value = priceFromSlider.value;
        priceFromDisplay.textContent = formatPrice(priceFromSlider.value);
      };
      const syncInputToSlider = () => {
        priceFromSlider.value = priceFromInput.value;
        priceFromDisplay.textContent = formatPrice(priceFromInput.value);
      };
      priceFromSlider.addEventListener('input', syncSliderToInput);
      priceFromInput.addEventListener('input', syncInputToSlider);
    }

    if (priceToSlider && priceToInput && priceToDisplay) {
      const syncSliderToInput = () => {
        priceToInput.value = priceToSlider.value;
        priceToDisplay.textContent = formatPrice(priceToSlider.value);
      };
      const syncInputToSlider = () => {
        priceToSlider.value = priceToInput.value;
        priceToDisplay.textContent = formatPrice(priceToInput.value);
      };
      priceToSlider.addEventListener('input', syncSliderToInput);
      priceToInput.addEventListener('input', syncInputToSlider);
    }
  };

  const renderCurrentImages = (images) => {
    if (!currentImagesDiv || !images || !images.length) return;
    if (currentImagesContainer) currentImagesContainer.hidden = false;
    currentImagesDiv.innerHTML = images
      .map((img, index) => `<img src="${img}" alt="Ảnh ${index + 1}">`)
      .join('');
  };

  const renderNewImagePreview = (files) => {
    if (!newImagePreview) return;
    if (!files.length) {
      newImagePreview.innerHTML = '';
      return;
    }
    newImagePreview.innerHTML = files
      .map((file) => `<img src="${URL.createObjectURL(file)}" alt="${file.name}">`)
      .join('');
  };

  const fillForm = (room) => {
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value || '';
    };

    setValue('title', room.title);
    setValue('address', room.address);
    setValue('district', room.district);
    setValue('city', room.city);
    setValue('mapAddress', room.mapAddress);
    setValue('area', room.area);
    setValue('direction', room.direction);
    setValue('bedrooms', room.bedrooms);
    setValue('bathrooms', room.bathrooms);
    setValue('status', room.status || 'AVAILABLE');
    setValue('description', room.description);
    setValue('contactName', room.contact?.name);
    setValue('contactPhone', room.contact?.phone);
    setValue('contactEmail', room.contact?.email);

    const priceFrom = room.priceFrom || 3000000;
    const priceTo = room.priceTo || 7000000;

    const priceFromSlider = document.getElementById('priceFromSlider');
    const priceFromInput = document.getElementById('priceFrom');
    const priceFromDisplay = document.getElementById('priceFromDisplay');
    const priceToSlider = document.getElementById('priceToSlider');
    const priceToInput = document.getElementById('priceTo');
    const priceToDisplay = document.getElementById('priceToDisplay');

    if (priceFromSlider) priceFromSlider.value = priceFrom;
    if (priceFromInput) priceFromInput.value = priceFrom;
    if (priceFromDisplay) priceFromDisplay.textContent = formatPrice(priceFrom);
    if (priceToSlider) priceToSlider.value = priceTo;
    if (priceToInput) priceToInput.value = priceTo;
    if (priceToDisplay) priceToDisplay.textContent = formatPrice(priceTo);

    if (room.images && room.images.length) {
      renderCurrentImages(room.images);
    }
  };

  const validatePayload = (payload) => {
    const requiredFields = [
      'title',
      'address',
      'district',
      'city',
      'mapAddress',
      'priceFrom',
      'priceTo',
      'area',
      'direction',
      'bedrooms',
      'bathrooms',
      'description'
    ];

    for (const field of requiredFields) {
      if (!payload[field] && payload[field] !== 0) {
        throw new Error('Vui lòng nhập đầy đủ thông tin phòng.');
      }
    }

    if (!payload.contact.name || !payload.contact.phone || !payload.contact.email) {
      throw new Error('Vui lòng nhập đủ thông tin liên hệ.');
    }

    if (Number(payload.priceFrom) > Number(payload.priceTo)) {
      throw new Error('Giá từ không được lớn hơn giá đến.');
    }
  };

  const loadRoom = async () => {
    if (!roomId) {
      showMessage('Không tìm thấy mã phòng.', 'error');
      return null;
    }

    try {
      const room = await window.ApiService?.getRoomById?.(roomId);
      if (!room) {
        showMessage('Phòng không tồn tại.', 'error');
        return null;
      }
      return room;
    } catch (error) {
      showMessage(error.message || 'Không thể tải thông tin phòng.', 'error');
      return null;
    }
  };

  const init = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      showMessage('Vui lòng đăng nhập để sửa tin.', 'error');
      setTimeout(redirectToLogin, 1500);
      return;
    }

    const fileInput = form?.querySelector('input[name="images"]');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files || []);
        renderNewImagePreview(files);
      });
    }

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const files = Array.from(formData.getAll('images')).filter((item) => item && item.name);

      const payload = {
        title: String(formData.get('title') || '').trim(),
        address: String(formData.get('address') || '').trim(),
        district: String(formData.get('district') || '').trim(),
        city: String(formData.get('city') || '').trim(),
        mapAddress: String(formData.get('mapAddress') || '').trim(),
        priceFrom: Number(formData.get('priceFrom')),
        priceTo: Number(formData.get('priceTo')),
        area: Number(formData.get('area')),
        direction: String(formData.get('direction') || '').trim(),
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        status: String(formData.get('status') || 'AVAILABLE').trim(),
        description: String(formData.get('description') || '').trim(),
        contact: {
          name: String(formData.get('contactName') || '').trim(),
          phone: String(formData.get('contactPhone') || '').trim(),
          email: String(formData.get('contactEmail') || '').trim()
        }
      };

      try {
        validatePayload(payload);
        await window.ApiService?.updateRoom?.(roomId, payload, files);
        showMessage('Cập nhật tin thành công!', 'success');
        setTimeout(redirectToMyListings, 1500);
      } catch (error) {
        showMessage(error.message || 'Không thể cập nhật tin lúc này.', 'error');
      }
    });
  };

  const main = async () => {
    init();
    initPriceSlider();
    const room = await loadRoom();
    if (room) {
      fillForm(room);
    }
  };

  main();
})();
