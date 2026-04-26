(() => {
  const contentNode = document.getElementById('roomDetailContent');
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('id');

  const showError = (message) => {
    if (contentNode) contentNode.innerHTML = `<p class="message error">${message}</p>`;
  };

  const renderRoom = (room) => {
    const currentUser = ApiService.getCurrentUser();
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(room.mapAddress || room.address)}&output=embed`;

    contentNode.innerHTML = `
      <div class="detail-layout page-enter">
        <section class="card zoom-hover detail-main">
          <div class="section-head">
            <div>
              <h1 class="section-title">${room.title}</h1>
              <p class="section-subtitle">${room.address}</p>
            </div>
            ${room.featured ? '<span class="featured-pill">Tin nổi bật</span>' : ''}
          </div>

          <div class="detail-toolbar">
            <button class="btn btn-outline" type="button" id="favoriteToggleBtn">${room.favorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}</button>
          </div>

          <div class="detail-stat-row">
            <div class="mini-stat"><strong>${room.viewCount || 0}</strong><span>Lượt xem</span></div>
            <div class="mini-stat"><strong>${room.contactClickCount || 0}</strong><span>Lượt liên hệ</span></div>
            <div class="mini-stat"><strong>${room.favoriteCount || 0}</strong><span>Lượt yêu thích</span></div>
            <div class="mini-stat"><strong>${room.reportCount || 0}</strong><span>Báo cáo</span></div>
          </div>

          <div class="detail-gallery" id="detailGallery">
            <div class="detail-gallery-main">
              <img id="mainImage" src="${room.images[0]}" alt="${room.title}">
            </div>
            <div class="thumbnail-row" id="thumbnailRow">
              ${room.images.map((img, index) => `
                  <button class="zoom-hover ${index === 0 ? 'active' : ''}" type="button" data-img="${img}">
                    <img src="${img}" alt="Ảnh ${index + 1}">
                  </button>
                `).join('')}
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

            <h3>Vị trí trên bản đồ</h3>
          <div class="map-wrap">
            <iframe src="${mapUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </section>

        <aside class="card zoom-hover detail-contact">
            <h3>Thông tin liên hệ</h3>
            <p><strong>Người đăng:</strong> ${room.contact?.name || 'Đang cập nhật'}</p>
            <p><strong>Số điện thoại:</strong> ${room.contact?.phone || 'Đang cập nhật'}</p>
            <p><strong>Email:</strong> ${room.contact?.email || 'Đang cập nhật'}</p>
            <a class="btn btn-primary" id="contactCallBtn" href="tel:${(room.contact?.phone || '').replace(/\s+/g, '')}">Gọi ngay</a>

          <div class="report-form">
              <h3 style="margin-top: 16px;">Báo cáo bài đăng</h3>
              <select id="reportReason">
                <option value="Sai thông tin">Sai thông tin</option>
                <option value="Trùng lặp">Trùng lặp</option>
                <option value="Lừa đảo">Lừa đảo</option>
                <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
              </select>
              <textarea id="reportDetail" placeholder="Mô tả ngắn lý do báo cáo"></textarea>
              <button class="btn btn-danger-outline" id="reportSubmitBtn" type="button">Gửi báo cáo</button>
              <p id="reportMessage" hidden></p>
              ${currentUser ? '' : '<p class="muted-note">Đăng nhập để gửi báo cáo và lưu yêu thích.</p>'}
          </div>
        </aside>
      </div>
    `;

    const mainImage = document.getElementById('mainImage');
    const thumbnailRow = document.getElementById('thumbnailRow');
    const favoriteToggleBtn = document.getElementById('favoriteToggleBtn');
    const reportSubmitBtn = document.getElementById('reportSubmitBtn');
    const reportMessage = document.getElementById('reportMessage');
    const contactCallBtn = document.getElementById('contactCallBtn');

    thumbnailRow?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-img]');
      if (!button || !mainImage) return;
      mainImage.src = button.dataset.img;
      thumbnailRow.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });

    favoriteToggleBtn?.addEventListener('click', async () => {
      if (!currentUser) {
        showError('Vui lòng đăng nhập để lưu phòng yêu thích.');
        return;
      }
      try {
        await ApiService.toggleFavorite(room.id, !room.favorited);
        init();
      } catch (error) {
        showError(error.message || 'Không thể cập nhật yêu thích.');
      }
    });

    contactCallBtn?.addEventListener('click', () => {
      ApiService.recordContactClick(room.id).catch(() => { });
    });

    reportSubmitBtn?.addEventListener('click', async () => {
      if (!currentUser) {
        if (reportMessage) {
          reportMessage.hidden = false;
          reportMessage.className = 'message error';
          reportMessage.textContent = 'Vui lòng đăng nhập để gửi báo cáo.';
        }
        return;
      }

      try {
        await ApiService.reportRoom(room.id, {
          reason: document.getElementById('reportReason')?.value || 'Sai thông tin',
          detail: document.getElementById('reportDetail')?.value?.trim() || ''
        });
        if (reportMessage) {
          reportMessage.hidden = false;
          reportMessage.className = 'message success';
          reportMessage.textContent = 'Đã gửi báo cáo cho admin.';
        }
      } catch (error) {
        if (reportMessage) {
          reportMessage.hidden = false;
          reportMessage.className = 'message error';
          reportMessage.textContent = error.message || 'Không thể gửi báo cáo.';
        }
      }
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
