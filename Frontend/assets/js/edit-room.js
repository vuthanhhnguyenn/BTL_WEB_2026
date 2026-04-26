(() => {
  const form = document.getElementById('editRoomForm');
  const messageNode = document.getElementById('editMessage');
  const newImagePreview = document.getElementById('newImagePreview');
  const imageCount = document.getElementById('newImageCount');
  const picker = document.getElementById('editImagePicker');
  const fileInput = document.getElementById('images');
  const currentImagesContainer = document.getElementById('currentImagesContainer');
  const currentImagesDiv = document.getElementById('currentImages');

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('id');

  const objectUrlMap = new WeakMap();
  let selectedFiles = [];
  let isDropActive = false;

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const getCurrentUser = () => window.ApiService?.getCurrentUser?.();

  const redirectToLogin = () => {
    window.location.href = 'login.html';
  };

  const redirectAfterSave = () => {
    if (window.ApiService?.isAdmin?.()) {
      window.location.href = 'admin.html';
      return;
    }
    window.location.href = 'my-listings.html';
  };

  const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value)} vnđ`;

  const updateImageCount = () => {
    if (!imageCount) return;
    imageCount.textContent = selectedFiles.length ? `${selectedFiles.length} ảnh mới đã chọn` : '0 ảnh';
  };

  const syncFilesToInput = () => {
    if (!fileInput) return;
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
  };

  const clearObjectUrls = (files = selectedFiles) => {
    files.forEach((file) => {
      const objectUrl = objectUrlMap.get(file);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });
  };

  const setPickerState = (active) => {
    isDropActive = active;
    picker?.classList.toggle('is-dragover', active);
  };

  const openFileDialog = () => fileInput?.click();

  const addFiles = (incomingFiles) => {
    const nextFiles = [...selectedFiles];
    incomingFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const exists = nextFiles.some(
        (current) =>
          current.name === file.name &&
          current.size === file.size &&
          current.lastModified === file.lastModified
      );
      if (!exists) nextFiles.push(file);
    });
    selectedFiles = nextFiles;
    syncFilesToInput();
    renderNewImagePreview();
  };

  const removeFileAt = (index) => {
    const removed = selectedFiles[index];
    if (removed) clearObjectUrls([removed]);
    selectedFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    syncFilesToInput();
    renderNewImagePreview();
  };

  const renderCurrentImages = (images) => {
    if (!currentImagesDiv) return;
    if (!images?.length) {
      if (currentImagesContainer) currentImagesContainer.hidden = true;
      currentImagesDiv.innerHTML = '';
      return;
    }
    if (currentImagesContainer) currentImagesContainer.hidden = false;
    currentImagesDiv.innerHTML = images
      .map((img, index) => `
        <article class="image-preview-card is-static">
          <img src="${img}" alt="Ảnh hiện tại ${index + 1}">
        </article>
      `)
      .join('');
  };

  const renderNewImagePreview = () => {
    if (!newImagePreview) return;

    const cards = selectedFiles.map((file, index) => {
      const objectUrl = objectUrlMap.get(file) || URL.createObjectURL(file);
      objectUrlMap.set(file, objectUrl);
      return `
        <article class="image-preview-card">
          <img src="${objectUrl}" alt="${file.name}">
          <button class="image-remove-btn" type="button" data-remove-index="${index}" aria-label="Xóa ảnh ${file.name}">×</button>
        </article>
      `;
    }).join('');

    newImagePreview.innerHTML = `
      ${cards}
      <button class="image-add-tile" type="button" id="editAddImageTile" aria-label="Thêm ảnh">
        <span class="image-add-plus">+</span>
        <span>Thêm ảnh</span>
      </button>
    `;

    newImagePreview.querySelectorAll('[data-remove-index]').forEach((button) => {
      button.addEventListener('click', () => removeFileAt(Number(button.dataset.removeIndex)));
    });
    newImagePreview.querySelector('#editAddImageTile')?.addEventListener('click', openFileDialog);
    updateImageCount();
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

    renderCurrentImages(room.images || []);
  };

  const validatePayload = (payload) => {
    const requiredFields = ['title', 'address', 'district', 'city', 'mapAddress', 'priceFrom', 'priceTo', 'area', 'direction', 'bedrooms', 'bathrooms', 'description'];

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
      const room = await window.ApiService?.getRoomForEdit?.(roomId);
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

    renderNewImagePreview();

    fileInput?.addEventListener('change', () => addFiles(Array.from(fileInput.files || [])));

    picker?.addEventListener('click', (event) => {
      if (event.target.closest('.image-remove-btn')) return;
      if (event.target.closest('.image-add-tile')) return;
      openFileDialog();
    });

    picker?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFileDialog();
      }
    });

    picker?.addEventListener('dragenter', (event) => {
      event.preventDefault();
      setPickerState(true);
    });

    picker?.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (!isDropActive) setPickerState(true);
    });

    picker?.addEventListener('dragleave', (event) => {
      event.preventDefault();
      if (event.target === picker) setPickerState(false);
    });

    picker?.addEventListener('drop', (event) => {
      event.preventDefault();
      setPickerState(false);
      addFiles(Array.from(event.dataTransfer?.files || []));
    });

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
        setTimeout(redirectAfterSave, 1500);
      } catch (error) {
        showMessage(error.message || 'Không thể cập nhật tin lúc này.', 'error');
      }
    });
  };

  const main = async () => {
    init();
    initPriceSlider();
    const room = await loadRoom();
    if (room) fillForm(room);
  };

  main();
})();
