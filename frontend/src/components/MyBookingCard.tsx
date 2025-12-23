import { useNavigate } from 'react-router-dom';
import type { BookingDetails } from '../apis/bookingApi';

interface MyBookingCardProps {
  booking: BookingDetails;
  onCancel: (bookingId: number) => void;
}

export default function MyBookingCard({ booking, onCancel }: MyBookingCardProps) {
  const navigate = useNavigate();
  console.log('Rendering MyBookingCard with booking:', booking);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge bg-success">Đã thanh toán</span>;
      case 'pending':
        return <span className="badge bg-warning">Chờ thanh toán</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="card bg-dark text-white">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Event Image */}
          <div className="col-md-2">
            {booking.event?.image_url && (
              <img
                src={booking.event.image_url}
                alt={booking.event.title}
                className="img-fluid rounded"
                style={{ height: '100px', objectFit: 'cover', width: '100%' }}
              />
            )}
          </div>

          {/* Booking Details */}
          <div className="col-md-6">
            <h5 className="card-title mb-2">
              {booking.event?.title || 'Sự kiện'}
            </h5>
            <p className="text-white small mb-1">
              <i className="bi bi-calendar-event me-2"></i>
              {booking.event?.date} {booking.event?.time}
            </p>
            <p className="text-white small mb-2">
              <i className="bi bi-geo-alt me-2"></i>
              {booking.event?.location}
            </p>
            <div className="mb-2">
              <small className="text-white me-3">
                Mã đặt vé: <strong>#{booking.booking_id}</strong>
              </small>
              <small className="text-white">
                Ngày đặt: {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
              </small>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* Price and Actions */}
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="mb-3">
              <div className="text-white small">Tổng tiền</div>
              <h4 className="text-primary mb-0">
                {typeof booking.total_amount === 'number' 
                  ? booking.total_amount.toLocaleString('vi-VN') 
                  : booking.total_amount} VNĐ
              </h4>
            </div>
            
            <div className="d-flex gap-2 justify-content-md-end">
              {booking.status === 'pending' && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onCancel(Number(booking.booking_id))}
                >
                  Hủy vé
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => alert('Tính năng tải vé đang được phát triển')}
                >
                  <i className="bi bi-download me-1"></i>
                  Tải vé
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => navigate(`/event/${booking.event_id}`)}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
