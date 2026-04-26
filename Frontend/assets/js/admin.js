(() => {
  const grid = document.getElementById('adminRoomsGrid');
  const messageNode = document.getElementById('adminMessage');
  const totalRoomsNode = document.getElementById('totalRooms');
  const pendingRoomsNode = document.getElementById('pendingRooms');
  const approvedRoomsNode = document.getElementById('approvedRooms');
  const reportList = document.getElementById('reportList');

  const showMessage = (message, type = 'success') => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
  };

  const formatDate = (value) => {
    if (!value) return 'Không rõ';
    return new Date(value).toLocaleString('vi-VN');
  };

  const getBadge = (status) => {
    const value = String(status || '').toUpperCase();
    if (value === 'PENDING') return '<span class="badge badge-warning">Chờ duyệt</span>';
    if (value === 'APPROVED' || value === 'AVAILABLE') return '<span class="badge badge-success">Đã duyệt</span>';
    if (value === 'REJECTED') return '<span class="badge badge-danger">Từ chối</span>';
    return `<span class="badge">${value || 'Không rõ'}</span>`;
  };

  const roomCardHtml = (room) => `
    <article class="card room-card zoom-hover page-enter">
      <div class="room-card-image-wrap">
        <img src="${room.images?.[0] || ''}" alt="${room.title}">
        <div class="room-card-status">${getBadge(room.status)}</div>
      </div>
      <div class="room-card-body">
        <h3>${room.title}</h3>
        <div class="room-meta">${room.address}</div>
        <div class="room-meta">Chủ tin: ${room.contact?.name || 'Đang cập nhật'}</div>
        <div class="room-price">${ApiService.formatCurrency(room.priceFrom)} - ${ApiService.formatCurrency(room.priceTo)}</div>
        <div class="room-meta">${room.area}m2 | ${room.favoriteCount || 0} yêu thích | ${room.reportCount || 0} báo cáo</div>
        <div class="room-card-actions">
          <a class="btn btn-outline" href="room-detail.html?id=${room.id}">Xem</a>
          <button class="btn btn-primary approve-btn" data-id="${room.id}" data-status="APPROVED">Duyet</button>
          <button class="btn btn-outline reject-btn" data-id="${room.id}" data-status="REJECTED">Tu choi</button>
          <button class="btn btn-danger-outline delete-btn" data-id="${room.id}">Xóa</button>
        </div>
      </div>
    </article>
  `;

  const reportItemHtml = (report) => `
    <article class="stack-item">
      <div class="stack-item-head">
        <div>
          <strong>${report.roomTitle || 'Bài đăng'}</strong>
          <div class="stack-item-meta">Người báo cáo: ${report.reporterName || 'Không rõ'} | ${formatDate(report.createdAt)}</div>
        </div>
        <span class="badge ${String(report.status || '').toUpperCase() === 'OPEN' ? 'badge-warning' : 'badge-success'}">${report.status || 'OPEN'}</span>
      </div>
      <div><strong>Lý do:</strong> ${report.reason}</div>
      <div class="stack-item-meta">${report.detail || 'Không có mô tả bổ sung.'}</div>
      <div class="room-card-actions">
        <a class="btn btn-outline" href="room-detail.html?id=${report.roomId}">Mở bài đăng</a>
        <button class="btn btn-primary report-status-btn" type="button" data-id="${report.id}" data-status="REVIEWED">Đánh dấu đã xem</button>
      </div>
    </article>
  `;

  const renderReports = async () => {
    if (!reportList) return;
    reportList.innerHTML = '<p>Đang tải báo cáo...</p>';
    try {
      const reports = await ApiService.getAdminReports();
      if (!reports.length) {
        reportList.innerHTML = '<p class="message">Chưa có báo cáo nào.</p>';
        return;
      }

      reportList.innerHTML = reports.map(reportItemHtml).join('');
      reportList.querySelectorAll('.report-status-btn').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await ApiService.updateReportStatus(button.dataset.id, button.dataset.status);
            showMessage('Đã cập nhật trạng thái báo cáo.', 'success');
            renderReports();
          } catch (error) {
            showMessage(error.message || 'Không thể cập nhật báo cáo.', 'error');
          }
        });
      });
    } catch (error) {
      reportList.innerHTML = `<p class="message error">${error.message || 'Không thể tải danh sách báo cáo.'}</p>`;
    }
  };

  const render = async () => {
    if (!grid) return;
    grid.innerHTML = '<p>Đang tải dữ liệu...</p>';

    try {
      const data = await ApiService.getAllRoomsForAdmin();
      const rooms = data?.content || [];
      const total = rooms.length;
      const pending = rooms.filter((room) => String(room.status || '').toUpperCase() === 'PENDING').length;
      const approved = rooms.filter((room) => {
        const s = String(room.status || '').toUpperCase();
        return s === 'APPROVED' || s === 'AVAILABLE';
      }).length;

      if (totalRoomsNode) totalRoomsNode.textContent = String(total);
      if (pendingRoomsNode) pendingRoomsNode.textContent = String(pending);
      if (approvedRoomsNode) approvedRoomsNode.textContent = String(approved);

      if (!rooms.length) {
        grid.innerHTML = '<p class="message">Hiện chưa có tin nào chờ duyệt.</p>';
        return;
      }

      grid.innerHTML = rooms.map(roomCardHtml).join('');

      grid.querySelectorAll('.approve-btn, .reject-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await ApiService.updateRoomStatus(btn.dataset.id, btn.dataset.status);
            showMessage('Đã cập nhật trạng thái bài đăng.', 'success');
            render();
          } catch (error) {
            showMessage(error.message || 'Không thể cập nhật trạng thái.', 'error');
          }
        });
      });

      grid.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Bạn chắc chắn muốn xóa bài đăng này?')) return;
          try {
            await ApiService.deleteRoom(btn.dataset.id);
            showMessage('Đã xóa bài đăng.', 'success');
            render();
            renderReports();
          } catch (error) {
            showMessage(error.message || 'Không thể xóa bài đăng.', 'error');
          }
        });
      });
    } catch (error) {
      grid.innerHTML = `<p class="message error">${error.message || 'Không thể tải danh sách quản trị.'}</p>`;
    }
  };

  const init = () => {
    if (!ApiService.isAdmin()) {
      if (grid) grid.innerHTML = '<p class="message error">Bạn cần quyền admin để vào trang này.</p>';
      return;
    }
    render();
    renderReports();
  };

  init();
})();
