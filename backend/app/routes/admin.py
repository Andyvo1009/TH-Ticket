# Admin routes
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from datetime import datetime, date
from app.extensions import db
from app.models.user import User
from app.models.event import Event
from app.models.booking import Booking, BookingLine
from app.models.payment import Payment, Cancellation
from app.services.admin_service import AdminService
from sqlalchemy import func, desc

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


# Middleware to check if user is admin
def admin_required():
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'message': 'Chỉ admin mới có quyền truy cập'}), 403
        return None
    except Exception as e:
        print(f"Admin verification failed: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Cần đăng nhập với quyền admin'}), 401


# ==================== USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
def get_users():
    """Get all users with filtering and pagination"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        role = request.args.get('role')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = User.query
        
        if role:
            query = query.filter(User.role == role)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.phone_number.ilike(search_term)
                )
            )
        
        total = query.count()
        offset = (page - 1) * limit
        users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
        
        users_list = []
        for user in users:
            users_list.append({
                'id': user.user_id,
                'fullName': user.full_name if user.full_name else '',
                'email': user.email,
                'phoneNumber': user.phone_number if user.phone_number else '',
                'role': user.role if user.role else 'user',
                'gender': user.gender if user.gender else '',
                'birthDate': user.birth_date.isoformat() if user.birth_date else None,
                'createdAt': user.created_at.isoformat() if user.created_at else None,
            })
        
        total_pages = (total + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'users': users_list,
            'total': total,
            'page': page,
            'totalPages': total_pages
        }), 200
    except Exception as e:
        print(f"Error fetching users: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy danh sách người dùng: ' + str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID with statistics"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        result, status_code = AdminService.get_user_by_id(user_id)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching user: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy thông tin người dùng: ' + str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT', 'OPTIONS'])
def update_user(user_id):
    """Update user information"""
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        result, status_code = AdminService.update_user(user_id, data)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print(f"Error updating user: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi cập nhật người dùng: ' + str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE', 'OPTIONS'])
def delete_user(user_id):
    """Delete a user"""
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        result, status_code = AdminService.delete_user(user_id)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi xóa người dùng: ' + str(e)}), 500


# ==================== EVENT MANAGEMENT ====================

@admin_bp.route('/events', methods=['GET'])
def get_all_events():
    """Get all events (admin view) with statistics"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        category = request.args.get('category')
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = Event.query
        
        if category:
            query = query.filter(Event.category == category)
        
        now = datetime.utcnow()
        if status == 'upcoming':
            query = query.filter(Event.start_time > now)
        elif status == 'past':
            query = query.filter(Event.start_time < now)
        elif status == 'today':
            today = date.today()
            query = query.filter(func.date(Event.start_time) == today)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(Event.name.ilike(search_term))
        
        total = query.count()
        offset = (page - 1) * limit
        events = query.order_by(desc(Event.created_at)).offset(offset).limit(limit).all()
        
        events_list = []
        for event in events:
            total_bookings = Booking.query.filter_by(event_id=event.event_id).count()
            confirmed_bookings = Booking.query.filter_by(event_id=event.event_id, status='confirmed').count()
            
            total_tickets_sold = db.session.query(func.sum(BookingLine.quantity)).join(Booking).filter(
                Booking.event_id == event.event_id,
                Booking.status == 'confirmed'
            ).scalar() or 0
            
            total_revenue = db.session.query(func.sum(Payment.amount)).join(Booking).filter(
                Booking.event_id == event.event_id,
                Payment.payment_status == 'completed'
            ).scalar() or 0
            
            events_list.append({
                'id': event.event_id,
                'title': event.name,
                'description': event.description if event.description else '',
                'category': event.category if event.category else '',
                'date': event.start_time.date().isoformat() if event.start_time else '',
                'time': event.start_time.time().isoformat() if event.start_time else '',
                'location': event.venue_name if event.venue_name else '',
                'address': event.address if event.address else '',
                'image': event.image_url if event.image_url else '',
                'createdAt': event.created_at.isoformat() if event.created_at else None,
                'organizerId': event.organizer_id,
                'approved': event.approved,
                'statistics': {
                    'totalBookings': total_bookings,
                    'confirmedBookings': confirmed_bookings,
                    'ticketsSold': int(total_tickets_sold),
                    'revenue': float(total_revenue)
                }
            })
        
        total_pages = (total + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'events': events_list,
            'total': total,
            'page': page,
            'totalPages': total_pages
        }), 200
    except Exception as e:
        print(f"Error fetching events: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy danh sách sự kiện: ' + str(e)}), 500


@admin_bp.route('/events/<int:event_id>/approval', methods=['PUT', 'OPTIONS'])
def update_event_approval(event_id):
    """Update event approval status"""
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Không tìm thấy sự kiện'}), 404
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['approved', 'pending', 'rejected']:
            return jsonify({'success': False, 'message': 'Trạng thái không hợp lệ'}), 400
        
        event.approved = new_status
        event.updated_at = datetime.utcnow()
        db.session.commit()
        
        status_message = {
            'approved': 'Sự kiện đã được phê duyệt',
            'rejected': 'Sự kiện đã bị từ chối',
            'pending': 'Sự kiện đang chờ xét duyệt'
        }
        
        return jsonify({
            'success': True,
            'message': status_message.get(new_status, 'Cập nhật trạng thái thành công'),
            'event': {
                'id': event.event_id,
                'name': event.name,
                'approved': event.approved
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating event approval: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi cập nhật trạng thái phê duyệt: ' + str(e)}), 500


@admin_bp.route('/events/<int:event_id>', methods=['DELETE', 'OPTIONS'])
def delete_event(event_id):
    """Delete an event"""
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Không tìm thấy sự kiện'}), 404
        
        # Check if event has confirmed bookings
        confirmed_bookings = Booking.query.filter_by(event_id=event_id).count()
        if confirmed_bookings > 0:
            return jsonify({'success': False, 'message': f'Không thể xóa sự kiện có {confirmed_bookings}người đặt vé '}), 400
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Xóa sự kiện thành công'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting event: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi xóa sự kiện: ' + str(e)}), 500


# ==================== BOOKING MANAGEMENT ====================

@admin_bp.route('/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings (admin view)"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        status = request.args.get('status')
        event_id = request.args.get('event_id')
        user_id = request.args.get('user_id')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = Booking.query
        
        if status:
            query = query.filter(Booking.status == status)
        if event_id:
            query = query.filter(Booking.event_id == int(event_id))
        if user_id:
            query = query.filter(Booking.user_id == int(user_id))
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Booking.booking_full_name.ilike(search_term),
                    Booking.booking_email.ilike(search_term),
                    Booking.booking_phone.ilike(search_term)
                )
            )
        
        total = query.count()
        offset = (page - 1) * limit
        bookings = query.order_by(desc(Booking.booking_date)).offset(offset).limit(limit).all()
        
        bookings_list = []
        for booking in bookings:
            total_amount = db.session.query(func.sum(Payment.amount)).filter_by(
                booking_id=booking.booking_id
            ).scalar() or 0
            
            booking_lines = []
            for line in booking.booking_lines:
                booking_lines.append({
                    'ticketId': line.ticket_id,
                    'ticketName': line.ticket.name if line.ticket else '',
                    'quantity': line.quantity,
                    'unitPrice': float(line.unit_price)
                })
            
            bookings_list.append({
                'id': booking.booking_id,
                'userId': booking.user_id,
                'eventId': booking.event_id,
                'eventName': booking.event.name if booking.event else '',
                'fullName': booking.booking_full_name,
                'email': booking.booking_email,
                'phone': booking.booking_phone,
                'bookingDate': booking.booking_date.isoformat() if booking.booking_date else None,
                'status': booking.status,
                'totalAmount': float(total_amount),
                'bookingLines': booking_lines
            })
        
        total_pages = (total + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'bookings': bookings_list,
            'total': total,
            'page': page,
            'totalPages': total_pages
        }), 200
    except Exception as e:
        print(f"Error fetching bookings: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy danh sách đặt vé: ' + str(e)}), 500


@admin_bp.route('/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get booking by ID"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        result, status_code = AdminService.get_booking_by_id(booking_id)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching booking: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy thông tin đặt vé: ' + str(e)}), 500


@admin_bp.route('/bookings/<int:booking_id>/status', methods=['PUT', 'OPTIONS'])
def update_booking_status(booking_id):
    """Update booking status"""
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        status = data.get('status')
        reason = data.get('reason')
        
        result, status_code = AdminService.update_booking_status(booking_id, status, reason)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print(f"Error updating booking status: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi cập nhật trạng thái đặt vé: ' + str(e)}), 500


# ==================== STATISTICS & DASHBOARD ====================

@admin_bp.route('/stats', methods=['GET'])
@admin_bp.route('/dashboard/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        total_users = User.query.count()
        total_events = Event.query.count()
        upcoming_events = Event.query.filter(Event.start_time > datetime.utcnow()).count()
        total_bookings = Booking.query.count()
        confirmed_bookings = Booking.query.filter_by(status='confirmed').count()
        pending_bookings = Booking.query.filter_by(status='pending').count()
        
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        today = date.today()
        first_day_of_month = date(today.year, today.month, 1)
        revenue_this_month = db.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'completed',
            Payment.created_at >= first_day_of_month
        ).scalar() or 0
        
        total_tickets_sold = db.session.query(func.sum(BookingLine.quantity)).join(Booking).filter(
            Booking.status == 'confirmed'
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': {
                'totalUsers': total_users,
                'totalEvents': total_events,
                'upcomingEvents': upcoming_events,
                'totalBookings': total_bookings,
                'confirmedBookings': confirmed_bookings,
                'pendingBookings': pending_bookings,
                'totalRevenue': float(total_revenue),
                'revenueThisMonth': float(revenue_this_month),
                'totalTicketsSold': int(total_tickets_sold)
            }
        }), 200
    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy thống kê: ' + str(e)}), 500


@admin_bp.route('/dashboard/recent-bookings', methods=['GET'])
def get_recent_bookings():
    """Get recent bookings"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        limit = int(request.args.get('limit', 10))
        result, status_code = AdminService.get_recent_bookings(limit)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching recent bookings: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy đặt vé gần đây: ' + str(e)}), 500


@admin_bp.route('/dashboard/top-events', methods=['GET'])
def get_top_events():
    """Get top events by tickets sold"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        limit = int(request.args.get('limit', 10))
        result, status_code = AdminService.get_top_events(limit)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching top events: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy sự kiện hàng đầu: ' + str(e)}), 500


# ==================== PAYMENT MANAGEMENT ====================

@admin_bp.route('/payments', methods=['GET'])
def get_payments():
    """Get all payments with filtering and pagination"""
    auth_error = admin_required()
    if auth_error:
        return auth_error
    
    try:
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        result, status_code = AdminService.get_all_payments(status, page, limit)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching payments: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy danh sách thanh toán: ' + str(e)}), 500
