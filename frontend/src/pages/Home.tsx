import { useEffect, useState } from 'react';
import NavBar from '../components/Header';
import HeroSlide from '../components/Hero-slide';
import CardSlider from '../components/CardSlider';
import eventApi, { type Event } from '../apis/eventApi';
import Footer from '../components/Footer';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [highlightedEvents, setHighlightedEvents] = useState<Event[]>([]);
  const [forYouEvents, setForYouEvents] = useState<Event[]>([]);
  const [musicEvents, setMusicEvents] = useState<Event[]>([]);
  const [sportsEvents, setSportsEvents] = useState<Event[]>([]);
  const [theatreEvents, setTheatreEvents] = useState<Event[]>([]);
  
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is admin
    
    
    const fetchEvents = async () => {
      try {
        // Fetch different event categories in parallel
        const [highlighted, music, sports, theatre, all] = await Promise.all([
          eventApi.getFeaturedEvents(8),     // Get top 8 featured events
          eventApi.getEventsByCategory('Music'),  // Get music events
          eventApi.getEventsByCategory('Sports'), // Get sports events
          eventApi.getEventsByCategory('Theatre'), // Get theatre events
          eventApi.getAllEvents({ limit: 8 })     // Get all events for "For You"
        ]);

        setHighlightedEvents(highlighted.events || []);
        setMusicEvents(music.events || []);
        setSportsEvents(sports.events || []);
        setTheatreEvents(theatre.events || []);
        setForYouEvents(all.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <NavBar />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <NavBar />
      <HeroSlide />
      
      {/* Highlighted Events Section */}
      {highlightedEvents.length > 0 && (
        <div className="container my-5">
          <div className="text-center mb-4 section-header">
            <h2 className="display-4 mb-3" id='highlighted-event'>Sự Kiện Nổi Bật</h2>
            <p>Khám phá các sự kiện thú vị đang diễn ra</p>
          </div>
          <CardSlider events={highlightedEvents} slidesPerView={4} />
        </div>
      )}

      {/* For You Section */}
      {forYouEvents.length > 0 && (
        <div className="container my-5">
          <div className="text-center mb-4 section-header">
            <h2 className="display-4 mb-3" id='for-you'>Dành cho bạn</h2>
            <p>Gợi ý sự kiện phù hợp với sở thích của bạn</p>
          </div>
          <CardSlider events={forYouEvents} slidesPerView={4} />
        </div>
      )}

      {/* Music Events Section */}
      {musicEvents.length > 0 && (
        <div className="container my-5">
          <div className="text-center mb-4 section-header">
            <h2 className="display-4 mb-3" id='music-event'>Âm nhạc</h2>
            <p>Các sự kiện âm nhạc sôi động</p>
          </div>
          <CardSlider events={musicEvents} slidesPerView={4} />
        </div>
      )}

      {/* Sports Events Section */}
      {sportsEvents.length > 0 && (
        <div className="container my-5">
          <div className="text-center mb-4 section-header">
            <h2 className="display-4 mb-3" id='sports-event'>Thể thao</h2>
            <p>Sự kiện thể thao đang hot</p>
          </div>
          <CardSlider events={sportsEvents} slidesPerView={4} />
        </div>
      )}
      
      {/* Theatre Events Section */}
      {theatreEvents.length > 0 && (
        <div className="container my-5">
          <div className="text-center mb-4 section-header">
            <h2 className="display-4 mb-3" id='theatre-event'>Sân khấu & Nghệ thuật</h2>
            <p>Các sự kiện sân khấu đang hot</p>
          </div>
          <CardSlider events={theatreEvents} slidesPerView={4} />
        </div>
      )}
      <Footer />
    </div>
  );
}