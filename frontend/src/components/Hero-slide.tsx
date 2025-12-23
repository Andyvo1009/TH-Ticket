interface HeroSlide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

interface HeroSlideProps {
  slides?: HeroSlide[];
}

const defaultSlides: HeroSlide[] = [
  {
    id: 1,
    image: 'https://img.mlbstatic.com/mlb-images/image/private/t_16x9/t_w2208/mlb/kqpmsiks5sfn6fojbdrh.png',
    title: 'Khám phá sự kiện tuyệt vời',
    description: 'Tham gia hàng ngàn sự kiện đa dạng từ âm nhạc, thể thao đến nghệ thuật',
    buttonText: 'Khám phá ngay',
    buttonLink: '#events'
  },
  {
    id: 2,
    image: 'https://i.redd.it/ed-sheeran-and-taylor-swift-at-the-eras-tour-london-15-v0-o7gfriilj4jd1.jpg?width=2048&format=pjpg&auto=webp&s=1a28dfd6e26328b5f8513c2002efa18c3c8ee774',
    title: 'Đặt vé dễ dàng',
    description: 'Đặt vé online nhanh chóng, an toàn và tiện lợi',
    buttonText: 'Đặt vé ngay',
    buttonLink: '#booking'
  },
  {
    id: 3,
    image: 'https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_xl_2x/f_auto/primary/sv4zhez2lyydydg8a4tb',
    title: 'Tạo sự kiện của bạn',
    description: 'Dễ dàng tạo và quản lý sự kiện của riêng bạn',
    buttonText: 'Tạo sự kiện',
    buttonLink: '#create'
  }
];

export default function HeroSlide({ slides = defaultSlides }: HeroSlideProps) {
  return (
    <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
      {/* Indicators */}
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : 'false'}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Slides */}
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <img
              src={slide.image}
              className="d-block w-100"
              alt={slide.title}
              style={{ height: '500px', objectFit: 'cover' }}
            />
            <div className="carousel-caption d-flex flex-column justify-content-center h-100">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-3">{slide.title}</h1>
                <p className="lead mb-4">{slide.description}</p>
                {slide.buttonText && (
                  <a href={slide.buttonLink || '#'} className="btn btn-primary btn-lg">
                    {slide.buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous/Next Controls */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
