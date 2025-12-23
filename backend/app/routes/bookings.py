# Booking routes
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.services.booking_service import BookingService
from app.extensions import db

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api')


@bookings_bp.route('/bookings/my-bookings', methods=['GET', 'OPTIONS'])
def get_bookings():
    """Get all bookings for current user"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        print(f"JWT verification failed: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': str(e)}), 401
    
    current_user_id = get_jwt_identity()
    
    try:
        result, status_code = BookingService.get_user_bookings(current_user_id)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching user bookings: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy vé: ' + str(e)}), 500


@bookings_bp.route('/bookings/<int:booking_id>', methods=['GET', 'OPTIONS'])
def get_booking(booking_id):
    """Get single booking details"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        print(f"JWT verification failed: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': str(e)}), 401
    
    current_user_id = get_jwt_identity()
    
    try:
        result, status_code = BookingService.get_booking(booking_id, current_user_id)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching booking details: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy chi tiết vé: ' + str(e)}), 500


@bookings_bp.route('/bookings', methods=['POST', 'OPTIONS'])
def create_booking():
    """Create a new booking"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        print(f"JWT verification failed: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Login is required'}), 401
    
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        event_id = data.get('event_id')
        tickets = data.get('ticket_types', [])
        booking_full_name = data.get('booking_full_name', '')
        booking_email = data.get('booking_email', '')
        booking_phone = data.get('booking_phone', '')
        
        if not event_id or not tickets:
            return jsonify({'success': False, 'message': 'Missing event or seat information'}), 400
        
        result, status_code = BookingService.create_booking(
            current_user_id, event_id, tickets,
            booking_full_name, booking_email, booking_phone
        )
        return jsonify(result), status_code
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating booking: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi đặt vé: ' + str(e)}), 500


@bookings_bp.route('/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update booking - to be implemented"""
    pass


@bookings_bp.route('/bookings/<int:booking_id>/cancel', methods=['POST', 'OPTIONS'])
def cancel_booking(booking_id):
    """Cancel a booking"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        return jsonify({'success': False, 'message': 'Cần đăng nhập để hủy vé'}), 401
    
    current_user_id = get_jwt_identity()
    
    try:
        result, status_code = BookingService.cancel_booking(booking_id, current_user_id)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling booking: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi hủy vé: ' + str(e)}), 500
