(() => {
  const listNode = document.getElementById('adminReportsList');
  const messageNode = document.getElementById('adminReportsMessage');

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
        <button class="btn btn-danger-outline report-delete-room-btn" type="button" data-room-id="${report.roomId}">Xóa bài viết bị báo cáo</button>
      </div>
    </article>
  `;

  const bindActions = () => {
    listNode.querySelectorAll('.report-status-btn').forEach((button) => {
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

    listNode.querySelectorAll('.report-delete-room-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Bạn chắc chắn muốn xóa bài viết bị báo cáo này?')) return;
        try {
          await ApiService.deleteRoom(button.dataset.roomId);
          showMessage('Đã xóa bài viết bị báo cáo.', 'success');
          renderReports();
        } catch (error) {
          showMessage(error.message || 'Không thể xóa bài viết bị báo cáo.', 'error');
        }
      });
    });
  };

  const renderReports = async () => {
    if (!listNode) return;
    listNode.innerHTML = '<p>Đang tải báo cáo...</p>';
    try {
      const reports = await ApiService.getAdminReports();
      if (!reports.length) {
        listNode.innerHTML = '<p class="message">Chưa có báo cáo nào.</p>';
        return;
      }
      listNode.innerHTML = reports.map(reportItemHtml).join('');
      bindActions();
    } catch (error) {
      listNode.innerHTML = `<p class="message error">${error.message || 'Không thể tải danh sách báo cáo.'}</p>`;
    }
  };

  const init = () => {
    if (!ApiService.isAdmin()) {
      if (listNode) listNode.innerHTML = '<p class="message error">Bạn cần quyền admin để vào trang này.</p>';
      return;
    }
    renderReports();
  };

  init();
})();
