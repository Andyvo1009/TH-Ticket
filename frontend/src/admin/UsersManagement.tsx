import { useEffect, useState } from 'react';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../apis/adminApi';
import type { User, UsersResponse } from '../apis/adminApi';
import '../styles/admin-dashboard.css';

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, [page, role, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: UsersResponse = await getAllUsers({
        page,
        limit: 10,
        role: role || undefined,
        search: search || undefined,
      });
      
      if (response.success) {
        setUsers(response.users);
        setTotalPages(response.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewUser = async (userId: number) => {
    try {
      const response = await getUserById(userId);
      if (response.success) {
        setSelectedUser(response.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
    }
  };

  const handleEditUser = (user: User) => {
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      gender: user.gender,
      birthDate: user.birthDate,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await updateUser(selectedUser.id, editForm);
      if (response.success) {
        setSuccess('Cập nhật người dùng thành công');
        setShowEditModal(false);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setSuccess('Xóa người dùng thành công');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Quản Lý Người Dùng</h1>

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

        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="filter-select">
          <option value="">Tất cả vai trò</option>
          <option value="user">User</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
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
                    <th>Họ Tên</th>
                    <th>Email</th>
                    <th>Số Điện Thoại</th>
                    <th>Vai Trò</th>
                    <th>Ngày Tạo</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.fullName || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'organizer' ? 'warning' : 'info'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td className="action-buttons">
                          <button onClick={() => handleViewUser(user.id)} className="btn btn-sm btn-info">Chi tiết</button>
                          <button onClick={() => handleEditUser(user)} className="btn btn-sm btn-warning">Sửa</button>
                          <button onClick={() => handleDeleteUser(user.id)} className="btn btn-sm btn-danger">Xóa</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">Không có người dùng nào</td>
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

      {/* User Detail Modal */}
      {selectedUser && !showEditModal && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Người Dùng</h2>
              <button onClick={() => setSelectedUser(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{selectedUser.id}</span>
                </div>
                <div className="detail-item">
                  <label>Họ Tên:</label>
                  <span>{selectedUser.fullName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-item">
                  <label>Số Điện Thoại:</label>
                  <span>{selectedUser.phoneNumber || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Vai Trò:</label>
                  <span className={`badge badge-${selectedUser.role === 'admin' ? 'danger' : selectedUser.role === 'organizer' ? 'warning' : 'info'}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Giới Tính:</label>
                  <span>{selectedUser.gender || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày Sinh:</label>
                  <span>{formatDate(selectedUser.birthDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày Tạo:</label>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>

              {selectedUser.statistics && (
                <div className="statistics-section">
                  <h3>Thống Kê</h3>
                  <div className="stats-grid-small">
                    <div className="stat-item">
                      <label>Tổng Đặt Vé:</label>
                      <span>{selectedUser.statistics.totalBookings}</span>
                    </div>
                    <div className="stat-item">
                      <label>Đã Xác Nhận:</label>
                      <span>{selectedUser.statistics.confirmedBookings}</span>
                    </div>
                    <div className="stat-item">
                      <label>Đã Hủy:</label>
                      <span>{selectedUser.statistics.cancelledBookings}</span>
                    </div>
                    <div className="stat-item">
                      <label>Tổng Chi Tiêu:</label>
                      <span>{formatCurrency(selectedUser.statistics.totalSpent)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh Sửa Người Dùng</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleUpdateUser} className="modal-body">
              <div className="form-group">
                <label>Họ Tên</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input
                  type="text"
                  value={editForm.phoneNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Vai Trò</label>
                <select
                  value={editForm.role || 'user'}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'organizer' | 'admin' })}
                  className="form-control"
                >
                  <option value="user">User</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giới Tính</label>
                <select
                  value={editForm.gender || ''}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="form-control"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ngày Sinh</label>
                <input
                  type="date"
                  value={editForm.birthDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Cập Nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
