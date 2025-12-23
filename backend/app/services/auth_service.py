# Authentication service - Business logic
from app.extensions import db
from app.models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.utils.cache import cache_set, cache_get, cache_delete
from app.utils.mail.sender import send_otp_email
import re
import random


class AuthService:
    """Authentication service for user management"""
    
    @staticmethod
    def is_valid_email(email):
        """Check if an email address is valid"""
        pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def otp_generator():
        """Generate a 6-digit OTP"""
        return random.randint(100000, 999999)
    
    @staticmethod
    def register_user(data):
        """Register a new user"""
        email = data.get('email', '').strip().lower()
        phonenumber = data.get('phoneNumber', '')
        password = data.get('password', '')
        
        # Validate required fields
        if not all([email, password]):
            return {'success': False, 'message': 'Vui lòng điền đầy đủ thông tin'}, 400
        
        # Validate email format
        if not AuthService.is_valid_email(email):
            return {'success': False, 'message': 'Email không hợp lệ'}, 400
        
        # Check if user already exists
        existing_user = User.query.filter(User.email == email).first()
        if existing_user:
            return {'success': False, 'message': 'Email đã được sử dụng'}, 409
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            email=email,
            password_hash=hashed_password,
            phone_number=phonenumber
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create JWT access token
        access_token = create_access_token(identity=str(new_user.user_id))
        
        return {
            'success': True,
            'message': 'Đăng ký thành công',
            'user': {
                'user_id': new_user.user_id,
                'role': new_user.role
            },
            'access_token': access_token
        }, 201
    
    @staticmethod
    def login_user(login_credential, password):
        """Authenticate user and return token"""
        # Find user by email
        user = User.query.filter(User.email == login_credential.lower()).first()
        
        if not user:
            return {'success': False, 'message': 'Account does not exist'}, 401
        
        # Check password
        if not check_password_hash(user.password_hash, password):
            return {'success': False, 'message': 'Wrong password'}, 401
        
        # Create JWT access token
        access_token = create_access_token(identity=str(user.user_id))
        
        return {
            'success': True,
            'message': 'Đăng nhập thành công',
            'user': {
                'user_id': str(user.user_id),
                'role': user.role,
                'fullName': user.full_name
            },
            'access_token': access_token
        }, 200
    
    @staticmethod
    def forgot_password(email):
        """Send OTP for password reset"""
        user = User.query.filter_by(email=email).first()
        if not user:
            return {'success': False, 'message': 'Tài khoản không tồn tại'}, 401
        
        user_id = user.user_id
        otp = AuthService.otp_generator()
        cache_set(f"otp_{user_id}", otp, ex=300)  # OTP valid for 5 minutes
        
        send_otp_email(
            to_email=email,
            otp_code=str(otp),
            user_name=user.full_name if user.full_name else "User",
            expiry_minutes=5
        )
        
        return {'success': True, 'message': 'OTP đã được gửi đến email của bạn'}, 200
    
    @staticmethod
    def verify_otp(email, otp_provided):
        """Verify OTP for password reset"""
        user = User.query.filter_by(email=email).first()
        if not user:
            return {'success': False, 'message': 'Tài khoản không tồn tại'}, 401
        
        user_id = user.user_id
        otp_true = cache_get(f"otp_{user_id}")
        
        if not otp_true:
            return {'success': False, 'message': 'OTP đã hết hạn hoặc không tồn tại'}, 401
        
        if str(otp_true) != str(otp_provided):
            return {'success': False, 'message': 'OTP không đúng'}, 401
        
        cache_delete(f"otp_{user_id}")
        return {'success': True, 'message': 'Xác thực OTP thành công'}, 200
    
    @staticmethod
    def reset_password(email, new_password):
        """Reset user password"""
        user = User.query.filter_by(email=email).first()
        if not user:
            return {'success': False, 'message': 'Tài khoản không tồn tại'}, 401
        
        hashed_password = generate_password_hash(new_password)
        user.password_hash = hashed_password
        db.session.commit()
        
        return {'success': True, 'message': 'Đặt lại mật khẩu thành công'}, 200
