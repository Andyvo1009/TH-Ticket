import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row">
          {/* About Section */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="text-uppercase mb-3">Về chúng tôi</h5>
            <p className="text-light">
              Nền tảng đặt vé sự kiện hàng đầu tại Việt Nam. 
              Chúng tôi mang đến trải nghiệm tuyệt vời cho mọi sự kiện của bạn.
            </p>
            <div className="social-links mt-3">
              <a href="#" className="text-light me-3">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="bi bi-instagram fs-4"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="https://www.youtube.com/watch?v=qIskI2D_hy0&list=RDqIskI2D_hy0&start_radio=1&pp=ygUUcnVubmluZyB1cCB0aGF0IGhpbGygBwE%3D"  
              className="text-light"
              target="_blank"
              rel="noopener noreferrer"
              >
                <i className="bi bi-youtube fs-4"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="text-uppercase mb-3">Liên kết</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">
                  Trang chủ
                </Link>
              </li>
              
              <li className="mb-2">
                <Link to="/create-event" className="text-light text-decoration-none">
                  Tạo sự kiện
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/my-bookings" className="text-light text-decoration-none">
                  Đặt vé của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="text-uppercase mb-3">Danh mục</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/search?category=Music" className="text-light text-decoration-none">
                  Âm nhạc
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/search?category=Sports" className="text-light text-decoration-none">
                  Thể thao
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/search?category=Theatre" className="text-light text-decoration-none">
                  Sân khấu
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="text-uppercase mb-3">Liên hệ</h5>
            <ul className="list-unstyled text-light">
              <li className="mb-2">
                <i className="bi bi-geo-alt-fill me-2"></i>
                HCM, Việt Nam
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2"></i>
                +84 123 456 789
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2"></i>
                testmail10092004@gmail.com
              </li>
              <li className="mb-2">
                <i className="bi bi-clock-fill me-2"></i>
                24/7 Hỗ trợ
              </li>
            </ul>
          </div>
        </div>

        <hr className="bg-secondary" />

        {/* Copyright */}
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-light mb-0">
              © {new Date().getFullYear()} Event Booking. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="#" className="text-light text-decoration-none me-3">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-light text-decoration-none me-3">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-light text-decoration-none">
              Hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
