import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Header';
import MyBookingCard from '../components/MyBookingCard';
import bookingApi from '../apis/bookingApi';
import authApi from '../apis/authApi';
import type { BookingDetails } from '../apis/bookingApi';
import Footer from '../components/Footer';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    // Check if user is logged in
    if (!authApi.isAuthenticated()) {
      navigate('/');
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const result = await bookingApi.getMyBookings();
      
      if (result.success && result.bookings) {
        setBookings(result.bookings);
      } else {
        setError(result.message || 'Không thể tải danh sách đặt vé');
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('Đã xảy ra lỗi khi tải danh sách đặt vé');
    } finally {
      setLoading(false);
    }
  };

  
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt vé này?')) {
      return;
    }

    try {
      const result = await bookingApi.cancelBooking(bookingId);
      
      if (result.success) {
        alert('Hủy đặt vé thành công!');
        fetchBookings(); // Refresh the list
      } else {
        alert(result.message || 'Không thể hủy đặt vé');
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('Đã xảy ra lỗi khi hủy đặt vé');
    }
  };
  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white mb-0">Vé của tôi</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Đặt vé mới
          </button>
        </div>

        {/* Filter Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${filter === 'all' ? 'active' : 'text-white'}`}
              onClick={() => setFilter('all')}
            >
              Tất cả ({bookings.length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${filter === 'pending' ? 'active' : 'text-white'}`}
              onClick={() => setFilter('pending')}
            >
              Chờ thanh toán ({bookings.filter(b => b.status === 'pending').length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${filter === 'confirmed' ? 'active' : 'text-white'}`}
              onClick={() => setFilter('confirmed')}
            >
              Đã thanh toán ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${filter === 'cancelled' ? 'active' : 'text-white'}`}
              onClick={() => setFilter('cancelled')}
            >
              Đã hủy ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
          </li>
        </ul>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-ticket-perforated text-white" style={{ fontSize: '4rem' }}></i>
            <h4 className="text-white mt-3">
              {filter === 'all' ? 'Bạn chưa có đặt vé nào' : `Không có vé ${filter === 'pending' ? 'chờ thanh toán' : filter === 'confirmed' ? 'đã xác nhận' : 'đã hủy'}`}
            </h4>
            <p className="text-white">Khám phá các sự kiện và đặt vé ngay!</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
              Khám phá sự kiện
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBookings.map((booking) => (
              <div key={booking.booking_id} className="col-12">
                <MyBookingCard 
                  booking={booking} 
                  onCancel={handleCancelBooking}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
