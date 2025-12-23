# User service - Business logic
from app.extensions import db
from app.models.user import User
from werkzeug.security import generate_password_hash
from datetime import datetime


class UserService:
    """User service for profile management"""
    
    @staticmethod
    def get_user_profile(user_id):
        """Get user profile by ID"""
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'Tài khoản không tồn tại'}, 401
        
        return {
            'success': True,
            'user': {
                'email': user.email,
                'fullName': user.full_name if user.full_name else None,
                'gender': user.gender if user.gender else None,
                'birthDate': user.birth_date.isoformat() if user.birth_date else None,
                'phoneNumber': user.phone_number if user.phone_number else None,
            }
        }, 200
    
    @staticmethod
    def update_user_profile(user_id, data):
        """Update user profile"""
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'Tài khoản không tồn tại'}, 401
        
        full_name = data.get('fullName', '').strip()
        gender = data.get('gender', '').strip() if data.get('gender') else 'Male'
        birth_date = data.get('birthDate', '').strip()
        phone_number = data.get('phoneNumber', '').strip()
        
        user.full_name = full_name if full_name else user.full_name
        user.gender = gender if gender else user.gender
        user.birth_date = datetime.fromisoformat(birth_date) if birth_date else user.birth_date
        user.phone_number = phone_number if phone_number else user.phone_number
        
        db.session.commit()
        return {'success': True, 'message': 'Cập nhật thông tin thành công'}, 200
    
    @staticmethod
    def change_password(user_id, new_password):
        """Change user password"""
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'Tài khoản không tồn tại'}, 401
        
        hashed_password = generate_password_hash(new_password)
        user.password_hash = hashed_password
        db.session.commit()
        
        return {'success': True, 'message': 'Cập nhật thông tin thành công'}, 200
