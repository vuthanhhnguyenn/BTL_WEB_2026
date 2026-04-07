(() => {
  const contentNode = document.getElementById('roomDetailContent');

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('id');

  const showError = (message) => {
    if (contentNode) {
      contentNode.innerHTML = `<p class="message error">${message}</p>`;
    }
  };

  const renderRoom = (room) => {
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(room.mapAddress || room.address)}&output=embed`;

    contentNode.innerHTML = `
      <div class="detail-layout page-enter">
        <section class="card zoom-hover detail-main">
          <h1 class="section-title">${room.title}</h1>
          <p class="section-subtitle">${room.address}</p>

          <div class="detail-gallery" id="detailGallery">
            <div class="detail-gallery-main">
              <img id="mainImage" src="${room.images[0]}" alt="${room.title}">
            </div>
            <div class="thumbnail-row" id="thumbnailRow">
              ${room.images
                .map(
                  (img, index) => `
                    <button class="zoom-hover ${index === 0 ? 'active' : ''}" type="button" data-img="${img}">
                      <img src="${img}" alt="Ảnh ${index + 1}">
                    </button>`
                )
                .join('')}
            </div>
          </div>

          <div class="info-list">
            <div class="info-item"><strong>Khoảng giá:</strong><br>${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
            <div class="info-item"><strong>Diện tích:</strong><br>${room.area}m2</div>
            <div class="info-item"><strong>Hướng nhà:</strong><br>${room.direction}</div>
            <div class="info-item"><strong>Phòng ngủ:</strong><br>${room.bedrooms}</div>
            <div class="info-item"><strong>Phòng tắm:</strong><br>${room.bathrooms}</div>
            <div class="info-item"><strong>Khu vực:</strong><br>${room.district}, ${room.city}</div>
          </div>

          <h3>Mô tả chung</h3>
          <p>${room.description}</p>

          <h3>Vị trí bản đồ</h3>
          <div class="map-wrap">
            <iframe src="${mapUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </section>

        <aside class="card zoom-hover detail-contact">
          <h3>Thông tin liên hệ</h3>
          <p><strong>Người đăng:</strong> ${room.contact?.name || 'Đang cập nhật'}</p>
          <p><strong>Số điện thoại:</strong> ${room.contact?.phone || 'Đang cập nhật'}</p>
          <p><strong>Email:</strong> ${room.contact?.email || 'Đang cập nhật'}</p>
          <a class="btn btn-primary" href="tel:${(room.contact?.phone || '').replace(/\s+/g, '')}">Gọi ngay</a>
        </aside>
      </div>
    `;

    const mainImage = document.getElementById('mainImage');
    const thumbnailRow = document.getElementById('thumbnailRow');
    if (!mainImage || !thumbnailRow) return;

    thumbnailRow.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-img]');
      if (!button) return;
      const img = button.dataset.img;
      mainImage.src = img;
      thumbnailRow.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });
  };

  const init = async () => {
    if (!roomId) {
      showError('Không tìm thấy mã phòng. Vui lòng quay lại danh sách phòng trọ.');
      return;
    }

    const room = await ApiService.getRoomById(roomId);
    if (!room) {
      showError('Phòng không tồn tại hoặc đã bị gỡ.');
      return;
    }

    renderRoom(room);
  };

  init().catch((error) => showError(error.message));
})();
