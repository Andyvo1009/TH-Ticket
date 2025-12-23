# Admin service - Business logic for admin operations
from app.extensions import db
from app.models.user import User
from app.models.event import Event
from app.models.booking import Booking, BookingLine
from app.models.payment import Payment
from datetime import datetime, date
from sqlalchemy import func, desc


class AdminService:
    """Admin service for managing users, events, bookings, and statistics"""
    
    # ==================== USER MANAGEMENT ====================
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user details with statistics"""
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'Không tìm thấy người dùng'}, 404
        
        # Calculate user statistics
        total_bookings = Booking.query.filter_by(user_id=user_id).count()
        confirmed_bookings = Booking.query.filter_by(user_id=user_id, status='confirmed').count()
        cancelled_bookings = Booking.query.filter_by(user_id=user_id, status='cancelled').count()
        
        total_spent = db.session.query(func.sum(Payment.amount)).join(Booking).filter(
            Booking.user_id == user_id,
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        user_data = {
            'id': user.user_id,
            'fullName': user.full_name if user.full_name else '',
            'email': user.email,
            'phoneNumber': user.phone_number if user.phone_number else '',
            'role': user.role if user.role else 'user',
            'gender': user.gender if user.gender else '',
            'birthDate': user.birth_date.isoformat() if user.birth_date else None,
            'createdAt': user.created_at.isoformat() if user.created_at else None,
            'statistics': {
                'totalBookings': total_bookings,
                'confirmedBookings': confirmed_bookings,
                'cancelledBookings': cancelled_bookings,
                'totalSpent': float(total_spent)
            }
        }
        
        return {'success': True, 'user': user_data}, 200
    
    @staticmethod
    def update_user(user_id, data):
        """Update user information"""
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'Không tìm thấy người dùng'}, 404
        
        # Update fields if provided
        if 'fullName' in data:
            user.full_name = data['fullName']
        if 'email' in data:
            # Check if email is already taken by another user
            existing = User.query.filter(User.email == data['email'], User.user_id != user_id).first()
            if existing:
                return {'success': False, 'message': 'Email đã được sử dụng'}, 400
            user.email = data['email']
        if 'phoneNumber' in data:
            user.phone_number = data['phoneNumber']
        if 'role' in data and data['role'] in ['user', 'organizer', 'admin']:
            user.role = data['role']
        if 'gender' in data:
            user.gender = data['gender']
        if 'birthDate' in data and data['birthDate']:
            user.birth_date = datetime.fromisoformat(data['birthDate']).date()
        
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Cập nhật người dùng thành công',
            'user': {
                'id': user.user_id,
                'fullName': user.full_name,
                'email': user.email,
                'role': user.role
            }
        }, 200
    
    @staticmethod
    def delete_user(user_id):
        """Delete a user"""
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'Không tìm thấy người dùng'}, 404
        
        # Check if user has active bookings
        active_bookings = Booking.query.filter_by(user_id=user_id).count()
        if active_bookings > 0:
            return {'success': False, 'message': f'Không thể xóa người dùng có {active_bookings} đặt vé đang hoạt động'}, 400
        
        db.session.delete(user)
        db.session.commit()
        
        return {'success': True, 'message': 'Xóa người dùng thành công'}, 200
    
    # ==================== BOOKING MANAGEMENT ====================
    
    @staticmethod
    def get_booking_by_id(booking_id):
        """Get booking details"""
        booking = Booking.query.get(booking_id)
        if not booking:
            return {'success': False, 'message': 'Không tìm thấy đặt vé'}, 404
        
        # Get payment info
        payment = Payment.query.filter_by(booking_id=booking_id).first()
        payment_data = None
        if payment:
            payment_data = {
                'id': payment.payment_id,
                'method': payment.payment_method,
                'status': payment.payment_status,
                'amount': float(payment.amount),
                'transactionId': payment.transaction_id if payment.transaction_id else '',
                'createdAt': payment.created_at.isoformat() if payment.created_at else None
            }
        
        booking_lines = []
        for line in booking.booking_lines:
            booking_lines.append({
                'ticketId': line.ticket_id,
                'ticketName': line.ticket.name if line.ticket else '',
                'quantity': line.quantity,
                'unitPrice': float(line.unit_price),
                'subtotal': float(line.quantity * line.unit_price)
            })
        
        total_amount = sum(line['subtotal'] for line in booking_lines)
        
        booking_data = {
            'id': booking.booking_id,
            'userId': booking.user_id,
            'userName': booking.user.full_name if booking.user and booking.user.full_name else booking.booking_full_name,
            'eventId': booking.event_id,
            'eventName': booking.event.name if booking.event else '',
            'eventDate': booking.event.start_time.isoformat() if booking.event and booking.event.start_time else None,
            'fullName': booking.booking_full_name,
            'email': booking.booking_email,
            'phone': booking.booking_phone,
            'bookingDate': booking.booking_date.isoformat() if booking.booking_date else None,
            'status': booking.status,
            'totalAmount': float(total_amount),
            'bookingLines': booking_lines,
            'payment': payment_data
        }
        
        return {'success': True, 'booking': booking_data}, 200
    
    @staticmethod
    def update_booking_status(booking_id, status, reason=None):
        """Update booking status"""
        booking = Booking.query.get(booking_id)
        if not booking:
            return {'success': False, 'message': 'Không tìm thấy đặt vé'}, 404
        
        if status not in ['pending', 'confirmed', 'cancelled']:
            return {'success': False, 'message': 'Trạng thái không hợp lệ'}, 400
        
        booking.status = status
        db.session.commit()
        
        # Get updated booking data
        result, _ = AdminService.get_booking_by_id(booking_id)
        
        status_messages = {
            'confirmed': 'Đặt vé đã được xác nhận',
            'cancelled': 'Đặt vé đã bị hủy',
            'pending': 'Đặt vé đang chờ xử lý'
        }
        
        return {
            'success': True,
            'message': status_messages.get(status, 'Cập nhật trạng thái thành công'),
            'booking': result.get('booking')
        }, 200
    
    # ==================== STATISTICS & DASHBOARD ====================
    
    @staticmethod
    def get_recent_bookings(limit=10):
        """Get recent bookings"""
        bookings = Booking.query.order_by(desc(Booking.booking_date)).limit(limit).all()
        
        bookings_list = []
        for booking in bookings:
            total_amount = db.session.query(func.sum(Payment.amount)).filter_by(
                booking_id=booking.booking_id
            ).scalar() or 0
            
            bookings_list.append({
                'id': booking.booking_id,
                'eventName': booking.event.name if booking.event else '',
                'fullName': booking.booking_full_name,
                'bookingDate': booking.booking_date.isoformat() if booking.booking_date else None,
                'status': booking.status,
                'totalAmount': float(total_amount)
            })
        
        return {'success': True, 'bookings': bookings_list}, 200
    
    @staticmethod
    def get_top_events(limit=10):
        """Get top events by tickets sold"""
        top_events = db.session.query(
            Event.event_id,
            Event.name,
            Event.category,
            Event.start_time,
            func.sum(BookingLine.quantity).label('tickets_sold'),
            func.sum(Payment.amount).label('revenue')
        ).join(Booking, Booking.event_id == Event.event_id)\
         .join(BookingLine, BookingLine.booking_id == Booking.booking_id)\
         .join(Payment, Payment.booking_id == Booking.booking_id)\
         .filter(Booking.status == 'confirmed', Payment.payment_status == 'completed')\
         .group_by(Event.event_id, Event.name, Event.category, Event.start_time)\
         .order_by(desc('tickets_sold'))\
         .limit(limit)\
         .all()
        
        events_list = []
        for event in top_events:
            events_list.append({
                'id': event.event_id,
                'title': event.name,
                'category': event.category if event.category else '',
                'date': event.start_time.isoformat() if event.start_time else '',
                'ticketsSold': int(event.tickets_sold),
                'revenue': float(event.revenue)
            })
        
        return {'success': True, 'events': events_list}, 200
    
    # ==================== PAYMENT MANAGEMENT ====================
    
    @staticmethod
    def get_all_payments(status=None, page=1, limit=10):
        """Get all payments with filtering and pagination"""
        query = Payment.query
        
        if status:
            query = query.filter(Payment.payment_status == status)
        
        total = query.count()
        offset = (page - 1) * limit
        payments = query.order_by(desc(Payment.created_at)).offset(offset).limit(limit).all()
        
        payments_list = []
        for payment in payments:
            booking = Booking.query.get(payment.booking_id)
            event_name = booking.event.name if booking and booking.event else ''
            customer_name = booking.booking_full_name if booking else ''
            
            payments_list.append({
                'id': payment.payment_id,
                'bookingId': payment.booking_id,
                'eventName': event_name,
                'customerName': customer_name,
                'method': payment.payment_method,
                'status': payment.payment_status,
                'amount': float(payment.amount),
                'transactionId': payment.transaction_id if payment.transaction_id else '',
                'createdAt': payment.created_at.isoformat() if payment.created_at else None
            })
        
        total_pages = (total + limit - 1) // limit
        
        return {
            'success': True,
            'payments': payments_list,
            'total': total,
            'page': page,
            'totalPages': total_pages
        }, 200
