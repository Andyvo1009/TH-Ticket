import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CardGrid from '../components/CardGrid';
import type { Event } from '../types/event';
import eventApi from '../apis/eventApi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const showAll = searchParams.get('all') === 'true';
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;

        if (showAll) {
          // Fetch all events
          res = await eventApi.getAllEvents({ limit: 100 });
        } else if (category) {
          // Fetch by category
          res = await eventApi.getEventsByCategory(category);
        } else if (query) {
          // Fetch by search query
          res = await eventApi.searchEvents(query);
        } else {
          setEvents([]);
          setLoading(false);
          return;
        }

        if (res && res.events) {
          setEvents(res.events);
        } else {
          setEvents([]);
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Lỗi khi tìm kiếm');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, showAll]);

  const getPageTitle = () => {
    if (showAll) return 'Tất cả sự kiện';
    if (category) return `Sự kiện: ${category}`;
    if (query) return 'Kết quả tìm kiếm';
    return 'Tìm kiếm';
  };

  const getPageSubtitle = () => {
    if (showAll) return 'Khám phá tất cả sự kiện';
    if (category) return `Xem các sự kiện thuộc thể loại ${category}`;
    if (query) return `Từ khoá: "${query}"`;
    return '';
  };

  return (
    <>
      <Header />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-white mb-2">{getPageTitle()}</h2>
            <p className="text-white">{getPageSubtitle()}</p>
          </div>
          <button className="btn btn-outline-light" onClick={() => navigate('/')}>
            ← Quay lại
          </button>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted fs-5">Không tìm thấy sự kiện nào</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div>
            <p className="text-white mb-4">Tìm thấy <strong className="text-white">{events.length}</strong> sự kiện</p>
            <CardGrid events={events} cols={4} gap={4} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
