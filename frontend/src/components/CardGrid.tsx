import Card from './Card';
import type { Event } from '../types/event';

interface CardGridProps {
  events: Event[];
  cols?: number;
  gap?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export default function CardGrid({ 
  events, 
  cols = 4,
  gap = 4,
  loading = false,
  emptyMessage = 'Không có sự kiện nào'
}: CardGridProps) {
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">{emptyMessage}</p>
      </div>
    );
  }

  // Calculate responsive columns
  const getColClass = () => {
    switch (cols) {
      case 1:
        return 'col-12';
      case 2:
        return 'col-lg-6 col-md-12';
      case 3:
        return 'col-lg-4 col-md-6 col-sm-12';
      case 4:
        return 'col-lg-3 col-md-6 col-sm-12';
      case 5:
        return 'col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12';
      case 6:
        return 'col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12';
      default:
        return 'col-lg-3 col-md-6 col-sm-12';
    }
  };

  return (
    <div className={`row g-${gap}`}>
      {events.map((event) => (
        <div key={event.id} className={`${getColClass()} d-flex`}>
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
        </div>
      ))}
    </div>
  );
}
