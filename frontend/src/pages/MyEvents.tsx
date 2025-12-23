import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import authApi from '../apis/authApi';
import eventApi, { type Event } from '../apis/eventApi';
import Footer from '../components/Footer';
export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const isAuth = await authApi.isAuthenticated();
      if (!isAuth) {
        navigate('/');
        return;
      }
      fetchMyBookings();
    };

    checkAuth();
  }, [navigate]);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const data = await eventApi.getMyEvents()
  
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Lỗi khi tải vé của bạn');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Header />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white mb-0">Vé của tôi</h2>
          <button className="btn btn-outline-light" onClick={() => navigate('/')}>
            ← Quay lại
          </button>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-5">
            <p className="text-light fs-5">Bạn chưa đặt vé sự kiện nào</p>
            <button className="btn btn-primary" onClick={() => navigate('/search?all=true')}>
              Khám phá sự kiện
            </button>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div>
            <p className="text-light mb-4">
              Bạn có <strong className="text-white">{events.length}</strong> vé
            </p>

            <div className="row">
              {events.map((event) => (
                <div key={event.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card bg-dark border-secondary h-100">
                    {event.image && (
                      <img 
                        src={event.image} 
                        className="card-img-top" 
                        alt={event.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title text-white mb-3">
                        {event.title || 'Sự kiện'}
                      </h5>

                      <div className="mb-3">
                        <small className="text-light d-block">Danh mục:</small>
                        <p className="text-light mb-0">{event.category || 'N/A'}</p>
                      </div>

                      <div className="mb-3">
                        <small className="text-light d-block">Trạng thái:</small>
                        <span className={`badge ${
                          event.approved === 'approved' ? 'bg-success' :
                          event.approved === 'pending' ? 'bg-warning' :
                          event.approved === 'rejected' ? 'bg-danger' :
                          'bg-secondary'
                        }`}>
                          {event.approved === 'approved' ? 'Đã duyệt' :
                           event.approved === 'pending' ? 'Chờ duyệt' :
                           event.approved === 'rejected' ? 'Từ chối' :
                           'N/A'}
                        </span>
                      </div>

                      <div className="mb-3">
                        <small className="text-light d-block"><i className="bi bi-geo-alt"></i> Địa điểm:</small>
                        <p className="text-light mb-0">
                          {event.location || 'N/A'}
                        </p>
                      </div>

                      <div className="mb-3">
                        <small className="text-light d-block"><i className="bi bi-calendar-event"></i> Ngày sự kiện:</small>
                        <p className="text-light mb-0">
                          {event.date} {event.time}
                        </p>
                      </div>

                      <div className="mb-3">
                        <small className="text-light d-block">Ngày tạo:</small>
                        <p className="text-light mb-0">
                          {event.createdAt ? formatDate(event.createdAt) : 'N/A'}
                        </p>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => navigate(`/event/${event.id}`)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
