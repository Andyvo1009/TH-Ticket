import { useEffect, useState } from 'react';
import { getAllPayments } from '../apis/adminApi';
import type { AdminPayment, PaymentsResponse } from '../apis/adminApi';
import '../styles/admin-dashboard.css';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaymentsResponse = await getAllPayments({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      
      if (response.success) {
        setPayments(response.payments);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách thanh toán');
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
      completed: 'badge-success',
      failed: 'badge-danger',
      refunded: 'badge-info',
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusText = (status: string) => {
    const statusText: { [key: string]: string } = {
      pending: 'Đang xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      refunded: 'Đã hoàn tiền',
    };
    return statusText[status] || status;
  };

  const getMethodText = (method: string) => {
    const methodText: { [key: string]: string } = {
      momo: 'MoMo',
      vnpay: 'VNPay',
      zalopay: 'ZaloPay',
      credit_card: 'Thẻ tín dụng',
      bank_transfer: 'Chuyển khoản',
      cash: 'Tiền mặt',
    };
    return methodText[method] || method;
  };

  // Calculate total revenue
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="admin-page">
      <h1 className="page-title">Quản Lý Thanh Toán</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Stats */}
      <div className="stats-summary">
        <div className="stat-box">
          <label>Tổng Thanh Toán</label>
          <h3>{payments.length}</h3>
        </div>
        <div className="stat-box stat-success">
          <label>Tổng Doanh Thu</label>
          <h3>{formatCurrency(totalRevenue)}</h3>
        </div>
        <div className="stat-box stat-success">
          <label>Hoàn Thành</label>
          <h3>{payments.filter(p => p.status === 'completed').length}</h3>
        </div>
        <div className="stat-box stat-warning">
          <label>Đang Xử Lý</label>
          <h3>{payments.filter(p => p.status === 'pending').length}</h3>
        </div>
        <div className="stat-box stat-danger">
          <label>Thất Bại</label>
          <h3>{payments.filter(p => p.status === 'failed').length}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
      </div>

      {/* Payments Table */}
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
                    <th>Mã Đặt Vé</th>
                    <th>Sự Kiện</th>
                    <th>Khách Hàng</th>
                    <th>Phương Thức</th>
                    <th>Số Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Mã Giao Dịch</th>
                    <th>Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>
                          <span className="booking-id">#{payment.bookingId}</span>
                        </td>
                        <td>{payment.eventName}</td>
                        <td>{payment.customerName}</td>
                        <td>
                          <span className="method-badge">{getMethodText(payment.method)}</span>
                        </td>
                        <td><strong>{formatCurrency(payment.amount)}</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadge(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </td>
                        <td>
                          <code className="transaction-id">{payment.transactionId || 'N/A'}</code>
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">Không có thanh toán nào</td>
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
    </div>
  );
};

export default PaymentsManagement;
