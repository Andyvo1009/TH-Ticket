import NavBar from './Header';
import  userApi from '../apis/userApi';
import { useEffect, useState } from 'react';
export interface ProfileProps {
  fullName: string,
    gender: string,
    email: string,
    birthDate: string,
    phoneNumber: string
}
function Profile({fullName,gender,email,birthDate,phoneNumber}: ProfileProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [userData, setUserData] = useState<ProfileProps>({
        fullName,
        gender:'Male',
        email,
        birthDate,
        phoneNumber
    });

    useEffect(() => {
        setUserData({
            fullName: fullName,
            gender: gender,
            email: email,
            birthDate: birthDate,
            phoneNumber: phoneNumber
        });
    }, [fullName, gender, email, birthDate, phoneNumber]); // Add dependencies
    
    const [showChangePassword, setShowChangePassword] = useState(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };
     // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
    //   const formData = new FormData(e.currentTarget);
    //   const info = {
    //     fullName: formData.get('fullName') as string,
    //     phoneNumber: formData.get('phoneNumber') as string,
    //     gender: formData.get('gender') as string,
    //     birthDate: formData.get('birthDate') as string,
    //     email: formData.get('email') as string
    //   };
      try {
        const info = await userApi.changeUserInfo(userData);

        console.log('Change in submit',info)
        // setSuccess('Đăng ký thành công!');
        
        // Close modal with animation after 1.5 seconds
        
        
      } catch (err) {
        console.error('Registration error:', err);
      } finally {
        setIsEditMode(false);
      }
    };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    // TODO: Call API to change password
    try {
        const info = await userApi.changePassword(passwordData);
        console.log('Change user info successful:', info);
        
        // setSuccess('Đăng ký thành công!');
        
        // Close modal with animation after 1.5 seconds
        
        
      } catch (err) {
        console.error('Registration error:', err);
      } finally {
        setIsEditMode(false);
      }

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(false);
    
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset to original props data
    setUserData({
      fullName,
      gender,
      email,
      birthDate,
      phoneNumber
    });
  };

    return (<div className="App">
        <NavBar />

        <div className="container my-5">
          {/* Page Header */}
        <div className="text-center mb-5 section-header">
          <h2 className="display-4 mb-3">Thông Tin Cá Nhân</h2>
          <p>Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Profile Card */}
            <div className="card bg-dark mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-white mb-0">Thông Tin Tài Khoản</h3>
                  {!isEditMode && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsEditMode(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label text-white">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="mb-3">
                    <label htmlFor="gender" className="form-label text-white">
                      Giới tính
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={userData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  {/* Email (unchangeable) */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={userData.email}
                      disabled
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                    />
                    <small className="text-muted">Email không thể thay đổi</small>
                  </div>

                  {/* Birth Date */}
                  <div className="mb-3">
                    <label htmlFor="birthDate" className="form-label text-white">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="birthDate"
                      name="birthDate"
                      value={userData.birthDate}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label text-white">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={userData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      pattern="[0-9]{10}"
                      placeholder=""
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  {isEditMode && (
                    <div className="d-flex gap-2 mt-4">
                      <button type="submit" className="btn btn-primary flex-grow-1" >
                        <i className="bi bi-check-lg me-2"></i>
                        Lưu thay đổi
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary flex-grow-1"
                        onClick={handleCancel}
                      >
                        <i className="bi bi-x-lg me-2"></i>
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="card bg-dark">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-white mb-0">Đổi Mật Khẩu</h3>
                  {!showChangePassword && (
                    <button 
                      className="btn btn-outline-light"
                      onClick={() => setShowChangePassword(true)}
                    >
                      <i className="bi bi-key me-2"></i>
                      Thay đổi mật khẩu
                    </button>
                  )}
                {showChangePassword && (
                  <form onSubmit={handleChangePassword}>
                    {/* Current Password */}
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label text-white">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label text-white">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        minLength={6}
                        required
                      />
                      <small className="text-muted">Tối thiểu 6 ký tự</small>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label text-white">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        minLength={6}
                        required
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-4">
                      <button type="submit" className="btn btn-primary flex-grow-1">
                        <i className="bi bi-check-lg me-2"></i>
                        Đổi mật khẩu
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary flex-grow-1"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        <i className="bi bi-x-lg me-2"></i>
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="ms-4 ">
                {!showChangePassword && (
                  <p className="text-light mb-0">
                    Nhấn vào nút "Thay đổi mật khẩu" để cập nhật mật khẩu của bạn
                  </p>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    </div>)
    
}

export default Profile;