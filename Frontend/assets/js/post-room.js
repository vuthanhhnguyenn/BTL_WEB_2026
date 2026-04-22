(() => {
  const form = document.getElementById('postRoomForm');
  const preview = document.getElementById('imagePreview');
  const imageCount = document.getElementById('imageCount');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('images');
  const messageNode = document.getElementById('postMessage');

  const objectUrlMap = new WeakMap();
  let selectedFiles = [];
  let isDropActive = false;

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' vnđ';
  };

  const updateImageCount = () => {
    if (!imageCount) return;
    imageCount.textContent = selectedFiles.length ? `${selectedFiles.length} ảnh đã chọn` : '0 ảnh';
  };

  const syncFilesToInput = () => {
    if (!fileInput) return;

    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
  };

  const clearObjectUrls = (files = selectedFiles) => {
    files.forEach((file) => {
      const url = objectUrlMap.get(file);
      if (url) URL.revokeObjectURL(url);
    });
  };

  const setDropzoneState = (active) => {
    isDropActive = active;
    if (!dropzone) return;
    dropzone.classList.toggle('is-dragover', active);
  };

  const addFiles = (incomingFiles) => {
    const nextFiles = [...selectedFiles];
    incomingFiles.forEach((file) => {
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
    renderPreview(selectedFiles);
  };

  const removeFileAt = (index) => {
    const removed = selectedFiles[index];
    const nextFiles = selectedFiles.filter((_, currentIndex) => currentIndex !== index);
    if (removed) clearObjectUrls([removed]);
    selectedFiles = nextFiles;
    syncFilesToInput();
    renderPreview(selectedFiles);
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
      syncSliderToInput();
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
      syncSliderToInput();
    }
  };

  const renderPreview = (files) => {
    if (!preview) return;

    if (!files.length) {
      preview.innerHTML = '';
      updateImageCount();
      return;
    }

    preview.innerHTML = files
      .map((file, index) => {
        const objectUrl = objectUrlMap.get(file) || URL.createObjectURL(file);
        objectUrlMap.set(file, objectUrl);

        return `
          <article class="preview-card">
            <img src="${objectUrl}" alt="${file.name}">
            <div class="preview-card-body">
              <strong title="${file.name}">${file.name}</strong>
              <span>${Math.max(1, Math.round(file.size / 1024))} KB</span>
              <button type="button" class="btn btn-outline preview-remove-btn" data-remove-index="${index}">Xóa ảnh</button>
            </div>
          </article>
        `;
      })
      .join('');

    updateImageCount();

    preview.querySelectorAll('[data-remove-index]').forEach((button) => {
      button.addEventListener('click', () => {
        removeFileAt(Number(button.dataset.removeIndex));
      });
    });
  };

  const validatePayload = (payload, files) => {
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
        throw new Error('Vui lòng nhập đầy đủ thông tin phòng cho thuê.');
      }
    }

    if (!payload.contact.name || !payload.contact.phone || !payload.contact.email) {
      throw new Error('Vui lòng nhập đủ thông tin liên hệ người đăng tin.');
    }

    if (Number(payload.priceFrom) > Number(payload.priceTo)) {
      throw new Error('Giá từ không được lớn hơn giá đến.');
    }

    if (!files.length) {
      throw new Error('Vui lòng chọn ảnh từng phòng trước khi đăng tin.');
    }
  };

  const init = () => {
    if (!form) return;

    initPriceSlider();

    const fileInput = form.querySelector('input[name="images"]');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        addFiles(Array.from(fileInput.files || []));
      });
    }

    if (dropzone) {
      dropzone.addEventListener('click', (event) => {
        if (event.target === fileInput) return;
        fileInput?.click();
      });

      dropzone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInput?.click();
        }
      });

      dropzone.addEventListener('dragenter', (event) => {
        event.preventDefault();
        setDropzoneState(true);
      });

      dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (!isDropActive) setDropzoneState(true);
      });

      dropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        if (event.target === dropzone) setDropzoneState(false);
      });

      dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        setDropzoneState(false);
        const droppedFiles = Array.from(event.dataTransfer?.files || []).filter((file) =>
          file.type.startsWith('image/')
        );
        addFiles(droppedFiles);
      });
    }

    form.addEventListener('submit', async (event) => {
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
        description: String(formData.get('description') || '').trim(),
        contact: {
          name: String(formData.get('contactName') || '').trim(),
          phone: String(formData.get('contactPhone') || '').trim(),
          email: String(formData.get('contactEmail') || '').trim()
        }
      };

      try {
        validatePayload(payload, files);
        const created = await ApiService.createListing(payload, files);
        showMessage(`Đăng tin thành công với mã phòng #${created.id}.`, 'success');
        form.reset();
        clearObjectUrls();
        selectedFiles = [];
        syncFilesToInput();
        renderPreview([]);
        setDropzoneState(false);
      } catch (error) {
        showMessage(error.message || 'Không thể đăng tin lúc này.', 'error');
      }
    });

    updateImageCount();
  };

  init();
})();
