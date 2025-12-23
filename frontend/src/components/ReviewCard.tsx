interface ReviewCardProps {
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  helpful?: number;
}

export default function ReviewCard({
  userName,
  userAvatar,
  rating,
  date,
  comment,
  helpful = 0
}: ReviewCardProps) {
  return (
    <div className="review-card card bg-dark text-white mb-3">
      <div className="card-body">
        {/* User Info */}
        <div className="d-flex align-items-center mb-3">
          <div className="review-avatar me-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="rounded-circle" />
            ) : (
              <div className="avatar-placeholder rounded-circle">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-0">{userName}</h6>
            <small className="text-muted">{date}</small>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-2">
          {[...Array(5)].map((_, index) => (
            <i
              key={index}
              className={`bi bi-star${index < rating ? '-fill' : ''}`}
              style={{ color: index < rating ? '#ffc107' : '#6c757d' }}
            ></i>
          ))}
        </div>

        {/* Comment */}
        <p className="card-text mb-3">{comment}</p>

        {/* Helpful Button */}
        <div className="d-flex align-items-center">
          <button className="btn btn-sm btn-outline-secondary me-2">
            <i className="bi bi-hand-thumbs-up me-1"></i>
            Hữu ích ({helpful})
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-chat-dots me-1"></i>
            Trả lời
          </button>
        </div>
      </div>
    </div>
  );
}
