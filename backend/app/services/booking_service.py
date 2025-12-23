# Booking service - Business logic
from app.extensions import db
from app.models.booking import Booking, BookingLine
from app.models.event import Event, Ticket
from datetime import datetime


class BookingService:
    """Booking service for managing event bookings"""
    
    @staticmethod
    def create_booking(user_id, event_id, tickets, booking_full_name, booking_email, booking_phone):
        """Create a new booking"""
        event = Event.query.get(event_id)
        if not event:
            return {'success': False, 'message': 'Event does not exist'}, 404
        
        booking_details = []
        for ticket_info in tickets:
            ticket_id = ticket_info['ticket_id']
            quantity = ticket_info.get('quantity', 0)
            ticket = Ticket.query.get(ticket_id)
            
            if not ticket:
                return {'success': False, 'message': f'Ticket ID {ticket_id} does not exist'}, 404
            
            booking_detail = BookingLine(
                ticket_id=ticket_id,
                quantity=quantity,
                unit_price=ticket.price
            )
            booking_details.append(booking_detail)
        
        new_booking = Booking(
            user_id=user_id,
            event_id=event_id,
            booking_date=datetime.utcnow(),
            status='pending',
            booking_full_name=booking_full_name,
            booking_email=booking_email,
            booking_phone=booking_phone,
            booking_lines=booking_details
        )
        
        db.session.add(new_booking)
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Đặt vé thành công',
            'booking_id': new_booking.booking_id
        }, 201
    
    @staticmethod
    def get_user_bookings(user_id):
        """Get all bookings for a user"""
        bookings = Booking.query.filter_by(user_id=user_id).all()
        
        bookings_list = []
        for booking in bookings:
            event = booking.event
            booking_data = {
                'booking_id': booking.booking_id,
                'event_id': booking.event_id,
                'user_id': booking.user_id,
                'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
                'status': booking.status,
                'event': {
                    'title': event.name,
                    'description': event.description if event.description else '',
                    'category': event.category if event.category else '',
                    'date': str(event.start_time.isoformat()).replace('T', ' ') if event.start_time else None,
                    'location': event.venue_name if event.venue_name else '',
                    'image_url': event.image_url if event.image_url else ''
                } if event else None,
                'booking_details': [
                    {
                        'booking_line_id': detail.booking_line_id,
                        'unit_price': str(detail.unit_price),
                        'ticket': {
                            'ticket_id': detail.ticket.ticket_id if detail.ticket else None,
                            'name': detail.ticket.name if detail.ticket else '',
                            'price': str(detail.ticket.price) if detail.ticket else ''
                        } if detail.ticket else None
                    } for detail in booking.booking_lines
                ] if booking.booking_lines else [],
                'total_amount': int((sum(detail.unit_price * detail.quantity for detail in booking.booking_lines))) if booking.booking_lines else '0'
            }
            bookings_list.append(booking_data)
        
        return {
            'success': True,
            'bookings': bookings_list,
            'total': len(bookings_list)
        }, 200
    
    @staticmethod
    def get_booking(booking_id, user_id):
        """Get single booking details"""
        booking = Booking.query.get(booking_id)
        if not booking:
            return {'success': False, 'message': 'Không tìm thấy vé'}, 404
        
        # Check if booking belongs to current user
        if booking.user_id != user_id:
            return {'success': False, 'message': 'Bạn không có quyền xem vé này'}, 403
        
        event = booking.event
        booking_data = {
            'booking_id': booking.booking_id,
            'event_id': booking.event_id,
            'user_id': booking.user_id,
            'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
            'status': booking.status,
            'event': {
                'name': event.name,
                'description': event.description if event.description else '',
                'category': event.category if event.category else '',
                'start_time': event.start_time.isoformat() if event.start_time else None,
                'image_url': event.image_url if event.image_url else ''
            } if event else None,
            'booking_details': [
                {
                    'booking_line_id': detail.booking_line_id,
                    'unit_price': str(detail.unit_price),
                    'ticket': {
                        'ticket_id': detail.ticket.ticket_id if detail.ticket else None,
                        'name': detail.ticket.name if detail.ticket else '',
                        'price': str(detail.ticket.price) if detail.ticket else ''
                    } if detail.ticket else None
                } for detail in booking.booking_lines
            ] if booking.booking_lines else []
        }
        
        return {
            'success': True,
            'booking': booking_data
        }, 200
    
    @staticmethod
    def update_booking(booking_id, data):
        """Update booking - to be implemented"""
        pass
    
    @staticmethod
    def cancel_booking(booking_id, user_id):
        """Cancel a booking"""
        booking = Booking.query.get(booking_id)
        if not booking:
            return {'success': False, 'message': 'Không tìm thấy vé'}, 404
        
        # Check if booking belongs to current user
        if booking.user_id != user_id:
            return {'success': False, 'message': 'Bạn không có quyền hủy vé này'}, 403
        
        # Can only cancel confirmed bookings
        if booking.status != 'confirmed':
            return {'success': False, 'message': 'Chỉ có thể hủy vé đã xác nhận'}, 400
        
        booking.status = 'cancelled'
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Vé đã được hủy thành công',
            'booking': {
                'booking_id': booking.booking_id,
                'status': booking.status
            }
        }, 200
    
    @staticmethod
    def check_availability(event_id, quantity):
        """Check event ticket availability - to be implemented"""
        pass
