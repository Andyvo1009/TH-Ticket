import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentBookings, getTopEvents } from '../apis/adminApi';
import type { DashboardStats, RecentBooking, TopEvent } from '../apis/adminApi';
import '../styles/admin-dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, eventsRes] = await Promise.all([
        getDashboardStats(),
        getRecentBookings(5),
        getTopEvents(5),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (bookingsRes.success) setRecentBookings(bookingsRes.bookings);
      if (eventsRes.success) setTopEvents(eventsRes.events);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Dashboard Quản Trị</h1>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Tổng Người Dùng</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>{stats?.totalEvents || 0}</h3>
            <p>Tổng Sự Kiện</p>
            <small>{stats?.upcomingEvents || 0} sắp diễn ra</small>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats?.totalBookings || 0}</h3>
            <p>Tổng Đặt Vé</p>
            <small>{stats?.confirmedBookings || 0} đã xác nhận</small>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats?.totalRevenue || 0)}</h3>
            <p>Tổng Doanh Thu</p>
            <small>Tháng này: {formatCurrency(stats?.revenueThisMonth || 0)}</small>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats?.pendingBookings || 0}</h3>
            <p>Đơn Chờ Xử Lý</p>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">🎟️</div>
          <div className="stat-content">
            <h3>{stats?.totalTicketsSold || 0}</h3>
            <p>Vé Đã Bán</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Top Events */}
      <div className="dashboard-grid">
        {/* Recent Bookings */}
        <div className="dashboard-card">
          <h2 className="card-title">Đặt Vé Gần Đây</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sự Kiện</th>
                  <th>Khách Hàng</th>
                  <th>Thời Gian</th>
                  <th>Số Tiền</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.eventName}</td>
                      <td>{booking.fullName}</td>
                      <td>{formatDate(booking.bookingDate)}</td>
                      <td>{formatCurrency(booking.totalAmount)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                          {booking.status === 'pending' && 'Chờ xử lý'}
                          {booking.status === 'confirmed' && 'Đã xác nhận'}
                          {booking.status === 'cancelled' && 'Đã hủy'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Không có đơn đặt vé nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Events */}
        <div className="dashboard-card">
          <h2 className="card-title">Sự Kiện Hàng Đầu</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên Sự Kiện</th>
                  <th>Danh Mục</th>
                  <th>Vé Đã Bán</th>
                  <th>Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.length > 0 ? (
                  topEvents.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.title}</strong>
                      </td>
                      <td>
                        <span className="category-badge">{event.category}</span>
                      </td>
                      <td>{event.ticketsSold}</td>
                      <td>{formatCurrency(event.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Không có sự kiện nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
