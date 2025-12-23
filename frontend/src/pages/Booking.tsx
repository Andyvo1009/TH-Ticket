import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/Header';
import eventApi from '../apis/eventApi';
import bookingApi from '../apis/bookingApi';
import type { Event } from '../types/event';
import authApi from '../apis/authApi';
import {paymentApi} from '../apis/paymentApi';
import Footer from '../components/Footer';

export default function Booking() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ticket selections: { ticketTypeIndex: quantity }
  const [ticketSelections, setTicketSelections] = useState<Record<number, number>>({});
  
  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'payos'>('payos');
  
  // User info
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Check if user is logged in
    if (!authApi.isAuthenticated()) {
      navigate('/');
      return;
    }

    const fetchEventData = async () => {
      try {
        if (!eventId) {
          setError('ID sự kiện không hợp lệ');
          setLoading(false);
          return;
        }
        const eventData = await eventApi.getEventById(Number(eventId));
        if (!eventData) {
          setError('Không tìm thấy sự kiện');
        } else {
          setEvent(eventData as Event);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Không thể tải thông tin sự kiện');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const calculateTotal = () => {
    if (!event?.ticket_types || event.ticket_types.length === 0) return 0;
    
    return Object.entries(ticketSelections).reduce((total, [index, qty]) => {
      const ticketType = event.ticket_types![parseInt(index)];
      return total + (ticketType.price * qty);
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0);
  };

  const handleTicketQuantityChange = (ticketIndex: number, change: number) => {
    const currentQty = ticketSelections[ticketIndex] || 0;
    const newQty = currentQty + change;
    const ticketType = event?.ticket_types?.[ticketIndex];
    
    if (!ticketType) return;
    
    const maxQty = ticketType.availableQuantity || ticketType.quantity;
    
    if (newQty >= 0 && newQty <= maxQty) {
      setTicketSelections(prev => {
        const updated = { ...prev };
        if (newQty === 0) {
          delete updated[ticketIndex];
        } else {
          updated[ticketIndex] = newQty;
        }
        return updated;
      });
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      if (!event?.id) {
        throw new Error('Thông tin sự kiện không hợp lệ');
      }

      // Validate user info
      if (!userInfo.fullName || !userInfo.email || !userInfo.phone) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      // Validate ticket selections
      if (getTotalQuantity() === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 vé');
      }
      // Prepare ticket details for booking
      const ticketDetailsForBooking = Object.entries(ticketSelections).map(([index, qty]) => ({
        type: event.ticket_types![parseInt(index)].typeName,
        quantity: qty,
        ticket_id: event.ticket_types![parseInt(index)].id
      }));
      
      // Prepare ticket details for payment
      const ticketDetailsForPayment = Object.entries(ticketSelections).map(([index, qty]) => ({
        ticket_id: event.ticket_types![parseInt(index)].id,
        ticketTypeName: event.ticket_types![parseInt(index)].typeName,
        quantity: qty,
        price: event.ticket_types![parseInt(index)].price
      }));
      
      // Create booking
      const bookingData = {
        event_id: event.id,
        booking_full_name: userInfo.fullName,
        booking_email: userInfo.email,
        booking_phone: userInfo.phone,
        ticket_types: ticketDetailsForBooking,
        total_amount: calculateTotal(),
      };

      const result = await bookingApi.createBooking(bookingData);
      
      // Create payment based on selected method
      let paymentUrl: string;
      if (paymentMethod === 'payos') {
        const payment = await paymentApi.createPayOSPayment({
          booking_id: result.booking_id!,
          amount: bookingData.total_amount!,
          ticket_type: ticketDetailsForPayment
        });
        paymentUrl = payment.payment_url;
      } else {
        const payment = await paymentApi.createMomoPayment({
          booking_id: result.booking_id!,
          amount: bookingData.total_amount!,
          ticket_type: ticketDetailsForPayment
        });
        paymentUrl = payment.payUrl;
      }
      
      // Redirect to payment URL
     
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
      navigate("/my-bookings");
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
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

  if (error && !event) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <h2 className="text-white mb-3">{error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <h2 className="text-white">Không tìm thấy sự kiện</h2>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      
      <div className="container py-5">
        <button 
          className="btn btn-outline-light mb-4"
          onClick={() => navigate(`/event/${event.id}`)}
        >
          ← Quay lại
        </button>

        <h2 className="text-white mb-4">Đặt vé sự kiện</h2>

        <div className="row g-4">
          {/* Left Column - Booking Form */}
          <div className="col-lg-8">
            <div className="card bg-dark text-white">
              <div className="card-body">
                <h4 className="card-title mb-4">Thông tin người đặt</h4>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      Họ và tên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white"
                      id="fullName"
                      value={userInfo.fullName}
                      onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control bg-dark text-white"
                      id="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control bg-dark text-white"
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold"> Phương thức thanh toán <span className="text-danger">*</span>
                    </label>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div 
                          className={`card h-100 cursor-pointer ${paymentMethod === 'payos' ? 'border-primary border-3' : 'border-secondary'}`}
                          onClick={() => setPaymentMethod('payos')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center">
                            <input
                              type="radio"
                              className="form-check-input me-2"
                              checked={paymentMethod === 'payos'}
                              onChange={() => setPaymentMethod('payos')}
                            />
                            <h5 className="card-title mt-2">PayOS</h5>
                            <p className="card-text text-muted small">Thanh toán qua PayOS</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div 
                          className={`card h-100 cursor-pointer ${paymentMethod === 'momo' ? 'border-primary border-3' : 'border-secondary'}`}
                          onClick={() => setPaymentMethod('momo')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center">
                            <input
                              type="radio"
                              className="form-check-input me-2"
                              checked={paymentMethod === 'momo'}
                              onChange={() => setPaymentMethod('momo')}
                            />
                            <h5 className="card-title mt-2">MoMo</h5>
                            <p className="card-text text-muted small">Thanh toán qua ví MoMo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">                      Chọn loại vé <span className="text-danger">*</span>
                    </label>
                    {event.ticket_types && event.ticket_types.length > 0 ? (
                      <div className="ticket-types-list">
                        {event.ticket_types.map((ticketType, index) => {
                          const availableQty = ticketType.availableQuantity ?? ticketType.quantity;
                          const selectedQty = ticketSelections[index] || 0;
                          return (
                            <div key={index} className="card bg-secondary text-white mb-3">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="card-title mb-1">{ticketType.typeName}</h6>
                                    <p className="text-primary fw-bold mb-1">
                                      {ticketType.price.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                    <small className="text-white">
                                      Còn {availableQty} vé
                                    </small>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={() => handleTicketQuantityChange(index, -1)}
                                      disabled={selectedQty === 0}
                                    >
                                      -
                                    </button>
                                    <span className="fw-bold px-2" style={{ minWidth: '30px', textAlign: 'center' }}>
                                      {selectedQty}
                                    </span>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={() => handleTicketQuantityChange(index, 1)}
                                      disabled={selectedQty >= availableQty}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="alert alert-warning" role="alert">
                        Sự kiện này chưa có thông tin vé
                      </div>
                    )}
                    
                    {getTotalQuantity() > 0 && (
                      <div className="alert alert-info mt-3" role="alert">
                        <strong>Tổng số vé đã chọn:</strong> {getTotalQuantity()}
                      </div>
                      
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={processing}
                    
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận đặt vé'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4">
            <div className="card bg-dark text-white sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h4 className="card-title mb-4">Tóm tắt đơn hàng</h4>

                {/* Event Info */}
                <div className="mb-3">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="img-fluid rounded mb-3"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <h5 className="mb-2">{event.title}</h5>
                  <p className="text-white small mb-1">
                    <i className="bi bi-calendar-event me-2"></i>
                    {event.date} {event.time && `- ${event.time}`}
                  </p>
                  <p className="text-white small mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    {event.location}
                  </p>
                </div>

                <hr />

                {/* Price Breakdown */}
                <div className="mb-3">
                  {event.ticket_types && Object.keys(ticketSelections).length > 0 ? (
                    Object.entries(ticketSelections).map(([index, qty]) => {
                      const ticketType = event.ticket_types![parseInt(index)];
                      return (
                        <div key={index} className="d-flex justify-content-between mb-2">
                          <div>
                            <div className="fw-bold">{ticketType.typeName}</div>
                            <small className="text-muted">
                              {ticketType.price.toLocaleString('vi-VN')} VNĐ × {qty}
                            </small>
                          </div>
                          <span className="fw-bold">
                            {(ticketType.price * qty).toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted text-center py-3">
                      Chưa chọn vé nào
                    </div>
                  )}
                </div>

                <hr />

                {/* Total */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <strong className="fs-5">Tổng cộng:</strong>
                  <strong className="fs-4 text-primary">
                    {calculateTotal().toLocaleString('vi-VN')} VNĐ
                  </strong>
                </div>

                {/* Info */}
                <div className="alert alert-info mb-0" role="alert">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Bạn sẽ nhận được email xác nhận sau khi đặt vé thành công.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
