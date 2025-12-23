import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../components/Header';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import {paymentApi} from '../apis/paymentApi';
export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('order_code');
  useEffect(() => {
    if (orderCode) {
      paymentApi.failPayment(orderCode);
    }
  }, []);

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
                    className="bi bi-x-circle-fill text-warning" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                  </svg>
                </div>
                
                <h2 className="text-warning mb-3">Thanh toán đã bị hủy</h2>
                <p className="text-white mb-4">
                  Giao dịch của bạn đã bị hủy. Đơn hàng chưa được hoàn thành.
                </p>

                {orderCode && (
                  <div className="alert alert-secondary mb-4">
                    <small>
                      <strong>Mã đơn hàng:</strong> {orderCode}
                    </small>
                  </div>
                )}

                <div className="alert alert-info mb-4">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Bạn có thể thử lại thanh toán hoặc liên hệ với chúng tôi nếu cần hỗ trợ.
                  </small>
                </div>

                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <button 
                    className="btn btn-primary btn-lg px-4"
                    onClick={() => navigate(-1)}
                  >
                    Thử lại
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
