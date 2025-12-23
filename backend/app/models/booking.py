# Booking model
from app.extensions import db
from datetime import datetime


class Booking(db.Model):
    __tablename__ = 'bookings'
    booking_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    booking_full_name = db.Column(db.String(100), nullable=False)
    booking_email = db.Column(db.String(100), nullable=False)
    booking_phone = db.Column(db.String(20), nullable=False)
    booking_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.Enum('pending', 'confirmed', 'cancelled', name='booking_status'), nullable=False, default='pending')
    
    # Relationships
    booking_lines = db.relationship('BookingLine', backref='booking', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='booking', lazy=True)
    cancellations = db.relationship('Cancellation', backref='booking', lazy=True)
    
    def __repr__(self):
        return f'<Booking {self.id}>'

class BookingLine(db.Model):
    __tablename__ = 'booking_lines'
    booking_line_id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.ticket_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    def __repr__(self):
        return f'<BookingLine {self.booking_line_id}>'
