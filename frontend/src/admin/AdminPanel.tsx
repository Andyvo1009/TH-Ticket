import { useState } from 'react';
import Dashboard from './Dashboard';
import UsersManagement from './UsersManagement';
import EventsManagement from './EventsManagement';
import BookingsManagement from './BookingsManagement';
import PaymentsManagement from './PaymentsManagement';
import '../styles/admin-dashboard.css';

type AdminTab = 'dashboard' | 'users' | 'events' | 'bookings' | 'payments';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersManagement />;
      case 'events':
        return <EventsManagement />;
      case 'bookings':
        return <BookingsManagement />;
      case 'payments':
        return <PaymentsManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-panel">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            Người Dùng
          </button>
          <button
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span className="nav-icon">🎫</span>
            Sự Kiện
          </button>
          <button
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="nav-icon">📝</span>
            Đặt Vé
          </button>
          <button
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span className="nav-icon">💰</span>
            Thanh Toán
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;
