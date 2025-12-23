import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import {authApi} from '../apis/authApi';

interface FormProps {
  onClose: () => void;
  Popup: () => void;
  ForgotPasswordPopup?: () => void;
}

export const RegisterForm = ({ onClose,Popup }: FormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const credentials = {
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
    };
    try {
      const response = await authApi.register(credentials);
      console.log('Registration successful:', response.user);      
      setSuccess('Đăng ký thành công!');
      
      // Close modal with animation after 1.5 seconds
      setTimeout(() => {
        handleClose();
        // Reload to update header
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      const errorCode = err?.status || 0;
      if (errorCode===409){
        setError("Email đã được sử dụng");
      }
      else if (errorCode===400){
        setError("Thông tin chưa đầy đủ hoặc email không hợp lệ");
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`login-modal-card card p-4 shadow ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={handleClose}
        ></button>
        
        <h2 className="text-center mb-4">Đăng ký</h2>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setSuccess('')}
            ></button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
              disabled={loading}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
            <input
              type="tel"
              className="form-control"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Nhập số điện thoại của bạn"
              disabled={loading}
              required
            />
            
            
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading || !!success}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
          
          <div className="text-center">
            <small className="text-muted">
                Đã có tài khoản? <a 
                href="#" 
                className="text-primary text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  setIsClosing(true);
                  setTimeout(() => {
                    onClose();
                    Popup();
                  }, 300);
                }}
              >Đăng nhập ngay</a>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoginForm = ({ onClose, Popup, ForgotPasswordPopup }: FormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      const response = await authApi.login(credentials);
      console.log('Login successful:', response.user);
      
      setSuccess('Đăng nhập thành công!');
      
      // Close modal with animation after 1.5 seconds
      setTimeout(() => {
        handleClose();
        // Reload to update header
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      err
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`login-modal-card card p-4 shadow ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={handleClose}
        ></button>
        
        <h2 className="text-center mb-4">Đăng nhập</h2>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setSuccess('')}
            ></button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
              disabled={loading}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              disabled={loading}
              required
            />
          </div>
          
          {ForgotPasswordPopup && (
            <div className="text-end mb-2">
              <a 
                href="#" 
                className="text-primary text-decoration-none small"
                onClick={(e) => {
                  e.preventDefault();
                  setIsClosing(true);
                  setTimeout(() => {
                    onClose();
                    ForgotPasswordPopup();
                  }, 300);
                }}
              >
                Quên mật khẩu?
              </a>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading || !!success}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
          
          <div className="text-center">
            <small className="text-muted">
              Chưa có tài khoản? <a 
                href="#" 
                className="text-primary text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  setIsClosing(true);
                  setTimeout(() => {
                    onClose();
                    Popup();
                  }, 300);
                }}
              >
                Đăng ký ngay
              </a>
              
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ForgotPasswordForm = ({ onClose, Popup }: FormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState<string>('');

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);

    try {
      const response = await authApi.forgotPassword(emailValue);
      
      setSuccess(response.message || 'OTP đã được gửi đến email của bạn');
      
      // Move to OTP verification step after 1 second
      setTimeout(() => {
        setStep('otp');
        setSuccess('');
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi OTP';
      setError(errorMessage);
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const otpValue = formData.get('otp') as string;

    try {
      const response = await authApi.verifyOtp(email, otpValue);
      
      setSuccess(response.message || 'Xác thực OTP thành công!');
      
      // Move to password reset step after 1 second
      setTimeout(() => {
        setStep('password');
        setSuccess('');
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OTP không đúng';
      setError(errorMessage);
      console.error('Verify OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.resetPassword(email, newPassword);
      
      setSuccess(response.message || 'Đặt lại mật khẩu thành công!');
      
      // Close modal and redirect to login after successful reset
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu';
      setError(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`login-modal-card card p-4 shadow ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={handleClose}
        ></button>
        
        <h2 className="text-center mb-4">
          {step === 'email' ? 'Quên mật khẩu' : step === 'otp' ? 'Xác thực OTP' : 'Đặt lại mật khẩu'}
        </h2>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => setSuccess('')}
            ></button>
          </div>
        )}
        
        {step === 'email' ? (
          <form key="email-form" onSubmit={handleEmailSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Nhập email của bạn"
                disabled={loading}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading || !!success}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang gửi...
                </>
              ) : (
                'Gửi OTP'
              )}
            </button>
            
            <div className="text-center">
              <small className="text-muted">
                Đã nhớ mật khẩu? <a 
                  href="#" 
                  className="text-primary text-decoration-none"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsClosing(true);
                    setTimeout(() => {
                      onClose();
                      Popup();
                    }, 300);
                  }}
                >
                  Đăng nhập ngay
                </a>
              </small>
            </div>
          </form>
        ) : step === 'otp' ? (
          <form key="otp-form" onSubmit={handleOtpSubmit}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">Mã OTP</label>
              <input
                type="text"
                className="form-control"
                id="otp"
                name="otp"
                placeholder="Nhập mã OTP từ email"
                disabled={loading}
                required
                maxLength={6}
              />
              <small className="text-muted">OTP đã được gửi đến {email}</small>
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading || !!success}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xác thực...
                </>
              ) : (
                'Xác thực OTP'
              )}
            </button>
            
            <div className="text-center">
              <small className="text-muted">
                <a 
                  href="#" 
                  className="text-primary text-decoration-none"
                  onClick={(e) => {
                    e.preventDefault();
                    setStep('email');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Gửi lại OTP
                </a>
              </small>
            </div>
          </form>
        ) : (
          <form key="password-form" onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu mới"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading || !!success}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang đặt lại...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;