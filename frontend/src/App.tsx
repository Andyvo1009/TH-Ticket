import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminPanel from './admin/AdminPanel';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile/" element={<UserProfile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/organizer/my-events" element={<MyEvents />} />
        <Route path="/booking/:eventId" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
