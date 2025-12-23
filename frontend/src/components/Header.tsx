import searchIcon from '../assets/search-svgrepo-com.svg';
import plusIcon from '../assets/plus-circle-1441-svgrepo-com.svg';
import logoIcon from '../assets/svgviewer-output.svg';
import ticketIcon from '../assets/ticket-svgrepo-com.svg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginForm, { RegisterForm, ForgotPasswordForm } from './AuthForm';
import { authApi } from '../apis/authApi';
import userApi from '../apis/userApi';
export default function Header() {
  const navigate = useNavigate();
  const [PopupLogin, setPopupLogin] = useState(false);
  const [PopupRegister, setPopupRegister] = useState(false);
  const [PopupForgotPassword, setPopupForgotPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth =  await authApi.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const role = userApi.getUserRole();
        
        // Check if user is admin
        setIsAdmin(role === 'admin');
      } else {
        setIsAdmin(false);
      }
      const name = userApi.getUserName();
      setUserName(name || '');
    };

    checkAuth();
    
    // Listen for storage changes (in case user logs in from another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    setIsAuthenticated(false);
    setUserName('');
    navigate('/');
  };
 
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-lg">
        {/* Brand/Logo */}
        <a className="navbar-brand" onClick={() => navigate('/')} aria-label="Home">
          <img src={logoIcon} alt="Logo" />
        </a>

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Left: Nav Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                Thể loại
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/search?category=Music'); }}>Âm nhạc</a></li>
                <li><a className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/search?category=Sports'); }}>Thể thao</a></li>
                <li><a className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/search?category=Theatre'); }}>Nghệ thuật</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/search?all=true'); }}>Xem tất cả</a></li>
              </ul>
            </li>
          </ul>

          {/* Right: Search & Action Button */}
          <div className="d-flex gap-3 nav-right">
            {/* Search Bar with Icon Inside */}
            <form className="d-flex" role="search" onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}>
              <div className="input-group">
                <input 
                  className="form-control" 
                  type="search" 
                  placeholder="Tìm kiếm..." 
                  aria-label="Tìm kiếm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="btn btn-outline-muted search-btn" 
                  type="submit" 
                  aria-label="Tìm kiếm"
                >
                  <img src={searchIcon} alt="" className="search-icon" aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* Create Event Button */}
            <button 
              type="button" 
              className="d-flex align-items-center btn btn-outline-dark"
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/create-event');
                } else {
                  setPopupLogin(true);
                }
              }}
            >
              <img src={plusIcon} alt="" className="button-icon" aria-hidden="true" />
              Tạo Sự Kiện
            </button>
            
            {/* Admin Panel or My Tickets Button */}
            {isAdmin ? (
              <button 
                type="button" 
                className="d-flex align-items-center btn btn-outline-dark"
                onClick={() => navigate('/admin')}
              >
                <i className="bi bi-gear-fill" style={{ marginRight: '0.5rem' }}></i>
                Admin
              </button>
            ) : (
              <button 
                type="button" 
                className="d-flex align-items-center btn btn-outline-dark"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/my-bookings');
                  } else {
                    setPopupLogin(true);
                  }
                }}
              >
                <img src={ticketIcon} alt="" className="button-icon" aria-hidden="true" />
                Vé của tôi
              </button>
            )}
            
            {/* Login/Register or User Profile */}
            {!isAuthenticated ? (
              <button type="button" className="btn login-btn" onClick={() => { setPopupLogin(true) }}>
                <b>Đăng nhập | Đăng ký</b>
              </button>
            ) : (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-2" style={{ fontSize: '1.2rem' }}></i>
                  Tài khoản
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <span className="dropdown-item-text text-light small ">
                      {userName || 'User'}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
                      <i className="bi bi-person me-2"></i>
                      Thông tin cá nhân
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/organizer/my-events'); }}>
                      <i className="bi bi-calendar-event me-2"></i>
                      Sự kiện của tôi
                    </a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
    </nav>
    {PopupLogin && <LoginForm onClose={() => setPopupLogin(false)} Popup={() => setPopupRegister(true)} ForgotPasswordPopup={() => setPopupForgotPassword(true)} />}
    {PopupRegister && <RegisterForm onClose={() => setPopupRegister(false)} Popup={() => setPopupLogin(true)} />}
    {PopupForgotPassword && <ForgotPasswordForm onClose={() => setPopupForgotPassword(false)} Popup={() => setPopupLogin(true)} />}
    </>
  );
}
