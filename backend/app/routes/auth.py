# Authentication routes
from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.extensions import db
from flask_jwt_extended import  verify_jwt_in_request

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/auth/register', methods=['POST', 'OPTIONS'])
def register():
    """User registration endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Không có dữ liệu được gửi'}), 400
        
        result, status_code = AuthService.register_user(data)
        return jsonify(result), status_code
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi đăng ký: ' + str(e)}), 500


@auth_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """User login endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Không có dữ liệu được gửi'}), 400
        
        login_credential = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not login_credential or not password:
            return jsonify({'success': False, 'message': 'Enter login credential and password'}), 400
        
        result, status_code = AuthService.login_user(login_credential, password)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi đăng nhập'}), 500


@auth_bp.route('/auth/logout', methods=['POST', 'OPTIONS'])
def logout():
    """User logout endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        return jsonify({'success': True, 'message': 'Đăng xuất thành công'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi đăng xuất'}), 500


@auth_bp.route('/auth/forgot-password', methods=['GET', 'OPTIONS'])
def forgot_password():
    """Send OTP for password reset"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        email = request.args.get('email', '').strip().lower()
        if not email:
            return jsonify({'success': False, 'message': 'Vui lòng cung cấp email'}), 400
        
        result, status_code = AuthService.forgot_password(email)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({'success': False, 'message': f'Email không hợp lệ'}), 401


@auth_bp.route('/auth/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    """Verify OTP for password reset"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        otp_provided = data.get('otp', '').strip()
        
        if not email or not otp_provided:
            return jsonify({'success': False, 'message': 'Vui lòng cung cấp email và OTP'}), 400
        
        result, status_code = AuthService.verify_otp(email, otp_provided)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({'success': False, 'message': f'Yêu cầu không hợp lệ'}), 401


@auth_bp.route('/auth/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    """Reset user password"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        new_password = data.get('new_password', '').strip()
        
        if not email or not new_password:
            return jsonify({'success': False, 'message': 'Vui lòng cung cấp email và mật khẩu mới'}), 400
        
        result, status_code = AuthService.reset_password(email, new_password)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi: ' + str(e)}), 500

@auth_bp.route('/auth/is-auth', methods=['GET', 'OPTIONS'])
def is_auth():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        verify_jwt_in_request()
    except Exception as e:
        auth_header = request.headers.get('Authorization', 'No Authorization header')       
        return jsonify({'success': False, 'message': f'Token không hợp lệ hoặc thiếu {auth_header}'}), 401
    return jsonify({'success': True, 'message': 'Token hợp lệ'}), 200