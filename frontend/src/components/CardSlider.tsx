import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Swiper core styles (necessary for proper layout)
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Card from './Card';
import { type Event } from '../types/event';

interface CardSliderProps {
  events: Event[];
  slidesPerView?: number;
}

export default function CardSlider({ events, slidesPerView = 4 }: CardSliderProps) {
  return (
    <div className="card-slider-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={slidesPerView > 3 ? 1 : 1}
        navigation
        pagination={{ clickable: true }}
        loop={false}
        watchSlidesProgress={true}
        breakpoints={{
          480: {
            slidesPerView: Math.min(slidesPerView, 2),
            spaceBetween: 12,
          },
          640: {
            slidesPerView: Math.min(slidesPerView, 2),
            spaceBetween: 14,
          },
          768: {
            slidesPerView: Math.min(slidesPerView, 2),
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: slidesPerView,
            spaceBetween: 18,
          },
          1280: {
            slidesPerView: slidesPerView,
            spaceBetween: 20,
          },
          1536: {
            slidesPerView: slidesPerView,
            spaceBetween: 20,
          },
        }}
        className="card-swiper"
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <Card
            id={event.id}
              image={event.image}
              title={event.title}
              description={event.description}
              date={event.date}
              location={event.location}
              price={event.price ? `${Number(event.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
              buttonText="Xem chi tiết"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
