import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/Header';
import Footer from '../components/Footer';
import {paymentApi} from '../apis/paymentApi';
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const orderCode = searchParams.get('order_code');
  useEffect(() => {
    if (orderCode) {
      paymentApi.successPayment(orderCode);
    }
  }, [orderCode]);
  useEffect(() => {
    // Simulate verification delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Đang xác nhận...</span>
          </div>
          <p className="text-white mt-3">Đang xác nhận thanh toán...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card bg-dark text-white text-center">
              <div className="card-body py-5">
                <div className="mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="80" 
                    height="80" 
                    fill="currentColor" 
                    className="bi bi-check-circle-fill text-success" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                </div>
                
                <h2 className="text-success mb-3">Thanh toán thành công!</h2>
                <p className="text-white mb-4">
                  Đơn hàng của bạn đã được xác nhận. Vui lòng kiểm tra email để nhận thông tin chi tiết về vé.
                </p>

                {orderCode && (
                  <div className="alert alert-info mb-4">
                    <small>
                      <strong>Mã đơn hàng:</strong> {orderCode}
                    </small>
                  </div>
                )}

                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <button 
                    className="btn btn-primary btn-lg px-4"
                    onClick={() => navigate('/my-bookings')}
                  >
                    Xem đơn hàng của tôi
                  </button>
                  <button 
                    className="btn btn-outline-light btn-lg px-4"
                    onClick={() => navigate('/')}
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
