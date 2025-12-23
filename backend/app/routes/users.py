# User routes
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.services.user_service import UserService
from app.extensions import db

users_bp = Blueprint('users', __name__, url_prefix='/api')


@users_bp.route('/user', methods=['GET', 'PUT', 'OPTIONS'])
def user_profile():
    """Get or update user profile"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        return jsonify({'success': False, 'message': f'JWT expired'}), 401
    
    current_user = get_jwt_identity()
    
    if request.method == 'GET':
        try:
            result, status_code = UserService.get_user_profile(current_user)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'success': False, 'message': 'Đã xảy ra lỗi: ' + str(e)}), 500
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            result, status_code = UserService.update_user_profile(current_user, data)
            return jsonify(result), status_code
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi cập nhật thông tin: ' + str(e)}), 500


@users_bp.route('/user/change-password', methods=['POST', 'OPTIONS'])
def change_password():
    """Change user password"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Token không hợp lệ hoặc thiếu'}), 401
    
    current_user = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'newPassword' not in data:
        return jsonify({'success': False, 'message': 'Không có dữ liệu được gửi'}), 400
    
    try:
        new_password = data['newPassword']
        result, status_code = UserService.change_password(current_user, new_password)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi cập nhật mật khẩu: ' + str(e)}), 500
