import { useNavigate } from 'react-router-dom';
import calendarIcon from '../assets/calendar-alt-svgrepo-com.svg';

interface CardProps {
  id?: number;
  image?: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  price?: string;
  buttonText?: string;
}

export default function Card({
  id,
  image,
  title,
  description,
  date,
  location,
  price,
  buttonText = "Xem chi tiết"
}: CardProps) {
  const navigate = useNavigate();
  return (
    <div className="card h-100 shadow-sm">
      {image && (
        <img 
          src={image} 
          className="card-img-top" 
          alt={title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted"
        dangerouslySetInnerHTML={{ __html: description.length > 100 ? description.slice(0, 100) + "..." : description }}
        />
        
        {(date || location || price) && (
          <div className="mt-auto">
            {date && (
              <div className="d-flex align-items-center mb-2" style={{color:'white'}}>
                <img src={calendarIcon} alt="Calendar" className="icon" />
                {date}
              </div>
            )}
            {location && (
              <div className="d-flex align-items-center mb-2">
                <small className="text-muted">
                  <i className="bi bi-geo-alt me-2"></i>
                  {location}
                </small>
              </div>
            )}
            {price && (
              <div className="d-flex align-items-center mb-3">
                <small className="fw-bold text-primary">
                  {price}
                </small>
              </div>
            )}
          </div>
        )}
        
        <button 
          className="btn btn-primary w-100 mt-auto" 
          onClick={() => {
            navigate(`/event/${id}`);
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
