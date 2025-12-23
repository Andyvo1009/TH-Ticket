import { useState, useEffect } from 'react';
import NavBar from '../components/Header';
import type { Event } from '../types/event';
import eventApi from '../apis/eventApi';
import '../styles/quill-dark.css';
import Footer from '../components/Footer';
// Mock data - In real app, fetch from API
import { useParams, useNavigate } from 'react-router-dom';

import calendarIcon from '../assets/calendar-alt-svgrepo-com.svg';


export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await eventApi.getEventById(Number(id));
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEvent();
    }
  }, [id]);
  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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

      // const relatedEvents = eventApi.getEventById(Number(id)).filter(e => e.id !== event.id).slice(0, 8);
  return (
        <>
      <NavBar />
      
      {/* Event Header with Image */}
      <div className="event-detail-header" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${event.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '2rem'
      }}>
        <div className="container">
          <button 
            className="btn btn-outline-light mb-3"
            onClick={() => navigate('/')}
          >

            ← Quay lại
          </button>
          <h1 className="display-4 text-white fw-bold">{event.title}</h1>
          <div className="d-flex align-items-center gap-3 mt-3">
            <span className="badge bg-primary fs-6">{event.category || 'Sự kiện'}</span>
            {event.availableSeats !== undefined && event.totalSeats !== undefined && (
              <span className="text-white">
                <i className="bi bi-people-fill me-2"></i>
                {event.availableSeats} / {event.totalSeats} chỗ còn lại
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Left Column - Event Info */}
          <div className="col-lg-8">
            <div className="card bg-dark text-white mb-4">
              <div className="card-body">
                <h3 className="card-title mb-4">Thông tin sự kiện</h3>
                
                {event.description && (
                  <div 
                    className="event-description"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Info */}
          <div className="col-lg-4">
            <div className="card bg-dark text-white sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h4 className="card-title mb-4">Chi tiết</h4>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <img src={calendarIcon} alt="Calendar" className="icon me-2" style={{ width: '20px', filter: 'invert(1)' }} />
                    <strong>Ngày & Giờ:</strong>
                  </div>
                  <p className="ms-4 mb-0">
                    {event.date}
                    {event.time && ` - ${event.time}`}
                  </p>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    <strong>Địa điểm:</strong>
                  </div>
                  <p className="ms-4 mb-0">{event.location}</p>
                  {event.address && (
                    <p className="ms-4 mb-0 text-muted-white small">{event.address}</p>
                  )}
                </div>

                <div className="mb-3">
                  
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-person-fill me-2"></i>
                    <strong>Tổ chức:</strong>
                  </div>
                  <p className="ms-4 mb-0">{event.organizer || 'Đang cập nhật'}</p>
                </div>

                <hr className="my-4" />

                {event.price && (
                  <div className="mb-4">
                    <h3 className="text-primary mb-0">{event.price}</h3>
                    <small className="text-muted">/ người</small>
                  </div>
                )}

                <button 
                  className="btn btn-primary w-100 btn-lg"
                  onClick={() => navigate(`/booking/${event.id}`)}
                >
                  Đặt vé ngay
                </button>

                {event.availableSeats !== undefined && (
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Còn {event.availableSeats} vé
                    </small>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* Related Events
        <div className="container py-5">
            <div className="row g-4">
            {relatedEvents.length > 0 && (
              <div className="col-lg-8 ">
                <h3 className="text-white mb-4">Sự kiện liên quan</h3>
                <CardSlider events={relatedEvents} slidesPerView={4} />
              </div>
            
            )} */}

            <div className="col-lg-4 ">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-white mb-0">Đánh giá</h3>
                  <button className="btn btn-sm btn-primary">
                    Viết đánh giá
                  </button>
                </div>

                {/* Average Rating */}
                <div className="card bg-dark text-white mb-4">
                  <div className="card-body text-center">
                    <h2 className="display-4 mb-0">4.5</h2>
                    <div className="mb-2">
                      {[...Array(5)].map((_, index) => (
                        <i
                          key={index}
                          className={`bi bi-star${index < 4.5 ? '-fill' : ''}`}
                          style={{ color: index < 4.5 ? '#ffc107' : '#6c757d', fontSize: '1.2rem' }}
                        ></i>
                      ))}
                    </div>
                    {/* <small className="text-muted">Dựa trên {mockReviews.length} đánh giá</small> */}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="reviews-container" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                  {/* {mockReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      userName={review.userName}
                      userAvatar={review.userAvatar}
                      rating={review.rating}
                      date={review.date}
                      comment={review.comment}
                      helpful={review.helpful}
                    />
                  ))} */}
                </div>

                {/* Load More */}
                <button className="btn btn-outline-secondary w-100 mt-3">
                  Xem thêm đánh giá
                </button>
            </div>
        </div>
    {/* </div>
    </div> */}
        <Footer />
        </>
  );
}
