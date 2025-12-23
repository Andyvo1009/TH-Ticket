import { useEffect, useState } from 'react';
import { getAllAdminEvents, deleteAdminEvent, updateEventApproval } from '../apis/adminApi';
import type { AdminEvent, EventsResponse } from '../apis/adminApi';
import '../styles/admin-dashboard.css';

const EventsManagement = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [page, category, status, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: EventsResponse = await getAllAdminEvents({
        page,
        limit: 10,
        category: category || undefined,
        search: search || undefined,
      });
      
      if (response.success) {
        setEvents(response.events);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewEvent = (event: AdminEvent) => {
    setSelectedEvent(event);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;

    try {
      const response = await deleteAdminEvent(eventId);
      if (response.success) {
        setSuccess('Xóa sự kiện thành công');
        fetchEvents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa sự kiện');
    }
  };

  const handleApprovalChange = async (eventId: number, newStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      setError(null);
      const response = await updateEventApproval(eventId, newStatus);
      if (response.success) {
        setSuccess(response.message);
        fetchEvents();
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent({ ...selectedEvent, approved: newStatus });
        }
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái phê duyệt');
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getApprovalBadge = (status?: string) => {
    const statusConfig = {
      approved: { label: 'Phê duyệt', class: 'badge bg-success' },
      pending: { label: 'Chờ duyệt', class: 'badge bg-warning text-dark' },
      rejected: { label: 'Từ chối', class: 'badge bg-danger' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={config.class}>{config.label}</span>;
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Quản Lý Sự Kiện</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm theo tên sự kiện..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>

        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="filter-select">
          <option value="">Tất cả danh mục</option>
          <option value="concert">Concert</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conference</option>
          <option value="festival">Festival</option>
          <option value="sports">Sports</option>
          <option value="exhibition">Exhibition</option>
        </select>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="today">Hôm nay</option>
          <option value="past">Đã diễn ra</option>
        </select>
      </div>

      {/* Events Table */}
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
                    <th>Tên Sự Kiện</th>
                    <th>Danh Mục</th>
                    <th>Ngày</th>
                    <th>Địa Điểm</th>                    <th>Trạng thái</th>                    <th>Vé Đã Bán</th>
                    <th>Doanh Thu</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <tr key={event.id}>
                        <td>{event.id}</td>
                        <td>
                          <div className="event-title-cell">
                            {event.image && <img src={event.image} alt={event.title} className="event-thumbnail" />}
                            <span>{event.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">{event.category}</span>
                        </td>
                        <td>
                          {formatDate(event.date)}
                          <br />
                          <small>{formatTime(event.time)}</small>
                        </td>
                        <td>{event.location}</td>
                        <td>{getApprovalBadge(event.approved)}</td>
                        <td>{event.statistics.ticketsSold}</td>
                        <td>{formatCurrency(event.statistics.revenue)}</td>
                        <td className="action-buttons">
                          <button onClick={() => handleViewEvent(event)} className="btn btn-sm btn-info">Chi tiết</button>
                          <button onClick={() => handleDeleteEvent(event.id)} className="btn btn-sm btn-danger">Xóa</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">Không có sự kiện nào</td>
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Sự Kiện</h2>
              <button onClick={() => setSelectedEvent(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              {selectedEvent.image && (
                <div className="event-image-container">
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="event-detail-image" />
                </div>
              )}
              
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{selectedEvent.id}</span>
                </div>
                <div className="detail-item">
                  <label>Tên Sự Kiện:</label>
                  <span><strong>{selectedEvent.title}</strong></span>
                </div>
                <div className="detail-item">
                  <label>Danh Mục:</label>
                  <span className="category-badge">{selectedEvent.category}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày:</label>
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="detail-item">
                  <label>Giờ:</label>
                  <span>{formatTime(selectedEvent.time)}</span>
                </div>
                <div className="detail-item">
                  <label>Địa Điểm:</label>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="detail-item">
                  <label>Địa Chỉ:</label>
                  <span>{selectedEvent.address}</span>
                </div>
                <div className="detail-item">
                  <label>Organizer ID:</label>
                  <span>{selectedEvent.organizerId}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái phê duyệt:</label>
                  <span>{getApprovalBadge(selectedEvent.approved)}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày Tạo:</label>
                  <span>{formatDate(selectedEvent.createdAt)}</span>
                </div>
              </div>

              <div className="detail-item detail-full">
                <label>Mô Tả:</label>
                <p>{selectedEvent.description || 'Không có mô tả'}</p>
              </div>

              {/* Approval Actions */}
              <div className="approval-section mt-3 p-3 border rounded">
                <h4 className="mb-3">Phê duyệt sự kiện</h4>
                <div className="d-flex gap-2">
                  <button
                    onClick={() => handleApprovalChange(selectedEvent.id, 'approved')}
                    className="btn btn-success"
                    disabled={selectedEvent.approved === 'approved'}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => handleApprovalChange(selectedEvent.id, 'pending')}
                    className="btn btn-warning"
                    disabled={selectedEvent.approved === 'pending'}
                  >
                    <i className="bi bi-clock me-2"></i>
                    Chờ xét duyệt
                  </button>
                  <button
                    onClick={() => handleApprovalChange(selectedEvent.id, 'rejected')}
                    className="btn btn-danger"
                    disabled={selectedEvent.approved === 'rejected'}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Từ chối
                  </button>
                </div>
              </div>

              <div className="statistics-section">
                <h3>Thống Kê</h3>
                <div className="stats-grid-small">
                  <div className="stat-item">
                    <label>Tổng Đặt Vé:</label>
                    <span>{selectedEvent.statistics.totalBookings}</span>
                  </div>
                  <div className="stat-item">
                    <label>Đã Xác Nhận:</label>
                    <span>{selectedEvent.statistics.confirmedBookings}</span>
                  </div>
                  <div className="stat-item">
                    <label>Vé Đã Bán:</label>
                    <span>{selectedEvent.statistics.ticketsSold}</span>
                  </div>
                  <div className="stat-item">
                    <label>Doanh Thu:</label>
                    <span>{formatCurrency(selectedEvent.statistics.revenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
