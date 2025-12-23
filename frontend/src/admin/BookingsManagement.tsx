import { useEffect, useState } from 'react';
import { getAllBookings, getBookingById, updateBookingStatus } from '../apis/adminApi';
import type { AdminBooking, BookingsResponse } from '../apis/adminApi';
import '../styles/admin-dashboard.css';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter, search]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: BookingsResponse = await getAllBookings({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      
      if (response.success) {
        setBookings(response.bookings);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đặt vé');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewBooking = async (bookingId: number) => {
    try {
      const response = await getBookingById(bookingId);
      if (response.success) {
        setSelectedBooking(response.booking);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin đặt vé');
    }
  };

  const handleOpenStatusModal = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setCancelReason('');
    setShowStatusModal(true);

  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const response = await updateBookingStatus(
        selectedBooking.id,
        newStatus,
        newStatus === 'cancelled' ? cancelReason : undefined
      );
      
      if (response.success) {
        setSuccess('Cập nhật trạng thái thành công');
        setSelectedBooking(null);
        setShowStatusModal(false);
        fetchBookings();
        setTimeout(() => setSuccess(null), 50000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusText = (status: string) => {
    const statusText: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      confirmed: 'Thành công',
      cancelled: 'Đã hủy',
    };
    return statusText[status] || status;
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Quản Lý Đặt Vé</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-center">Đang tải...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sự Kiện</th>
                    <th>Khách Hàng</th>
                    <th>Liên Hệ</th>
                    <th>Thời Gian</th>
                    <th>Số Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.eventName}</td>
                        <td>{booking.fullName}</td>
                        <td>
                          <div className="contact-info">
                            <small>{booking.email}</small>
                            <br />
                            <small>{booking.phone}</small>
                          </div>
                        </td>
                        <td>{formatDate(booking.bookingDate)}</td>
                        <td><strong>{formatCurrency(booking.totalAmount)}</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadge(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button onClick={() => handleViewBooking(booking.id)} className="btn btn-sm btn-info">Chi tiết</button>
                          <button onClick={() => handleOpenStatusModal(booking)} className="btn btn-sm btn-warning">Cập nhật</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center">Không có đặt vé nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Trước
              </button>
              <span className="page-info">Trang {page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && !showStatusModal && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Đặt Vé</h2>
              <button onClick={() => setSelectedBooking(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Mã Đặt Vé:</label>
                  <span><strong>#{selectedBooking.id}</strong></span>
                </div>
                <div className="detail-item">
                  <label>Sự Kiện:</label>
                  <span>{selectedBooking.eventName}</span>
                </div>
                {selectedBooking.eventDate && (
                  <div className="detail-item">
                    <label>Ngày Sự Kiện:</label>
                    <span>{formatDate(selectedBooking.eventDate)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <label>Họ Tên:</label>
                  <span>{selectedBooking.fullName}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedBooking.email}</span>
                </div>
                <div className="detail-item">
                  <label>Số Điện Thoại:</label>
                  <span>{selectedBooking.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Thời Gian Đặt:</label>
                  <span>{formatDate(selectedBooking.bookingDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng Thái:</label>
                  <span className={`badge ${getStatusBadge(selectedBooking.status)}`}>
                    {getStatusText(selectedBooking.status)}
                  </span>
                </div>
              </div>

              {/* Booking Lines */}
              <div className="section-divider">
                <h3>Chi Tiết Vé</h3>
              </div>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Loại Vé</th>
                    <th>Số Lượng</th>
                    <th>Đơn Giá</th>
                    <th>Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBooking.bookingLines.map((line, index) => (
                    <tr key={index}>
                      <td>{line.ticketName}</td>
                      <td>{line.quantity}</td>
                      <td>{formatCurrency(line.unitPrice)}</td>
                      <td>{formatCurrency(line.subtotal || line.quantity * line.unitPrice)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3}><strong>Tổng Cộng</strong></td>
                    <td><strong>{formatCurrency(selectedBooking.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Info */}
              {selectedBooking.payment && (
                <>
                  <div className="section-divider">
                    <h3>Thông Tin Thanh Toán</h3>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Phương Thức:</label>
                      <span>{selectedBooking.payment.method}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng Thái:</label>
                      <span className={`badge ${selectedBooking.payment.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {selectedBooking.payment.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Số Tiền:</label>
                      <span><strong>{formatCurrency(selectedBooking.payment.amount)}</strong></span>
                    </div>
                    <div className="detail-item">
                      <label>Mã Giao Dịch:</label>
                      <span>{selectedBooking.payment.transactionId}</span>
                    </div>
                    <div className="detail-item">
                      <label>Thời Gian:</label>
                      <span>{formatDate(selectedBooking.payment.createdAt)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cập Nhật Trạng Thái</h2>
              <button onClick={() => setShowStatusModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleUpdateStatus} className="modal-body">
              <div className="form-group">
                <label>Trạng Thái Mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              
              {newStatus === 'cancelled' && (
                <div className="form-group">
                  <label>Lý Do Hủy</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="form-control"
                    rows={3}
                    placeholder="Nhập lý do hủy đặt vé..."
                  />
                </div>
              )}

              <div className="modal-footer">
                <button type="button" onClick={() => setShowStatusModal(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Cập Nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
