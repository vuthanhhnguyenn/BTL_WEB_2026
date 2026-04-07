(() => {
  const form = document.getElementById('postRoomForm');
  const preview = document.getElementById('imagePreview');
  const messageNode = document.getElementById('postMessage');

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const renderPreview = (files) => {
    if (!preview) return;
    if (!files.length) {
      preview.innerHTML = '';
      return;
    }

    preview.innerHTML = files
      .map((file) => `<img src="${URL.createObjectURL(file)}" alt="${file.name}">`)
      .join('');
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

    const fileInput = form.querySelector('input[name="images"]');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files || []);
        renderPreview(files);
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
        renderPreview([]);
      } catch (error) {
        showMessage(error.message || 'Không thể đăng tin lúc này.', 'error');
      }
    });
  };

  init();
})();
