# Event model
from app.extensions import db
from datetime import datetime


class Event(db.Model):
    __tablename__ = 'events'
    event_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    venue_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    province = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    ward = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    approved=db.Column(db.Enum('approved','pending','rejected', name='event_approval_status'), nullable=False, default='pending')
    # Relationships
    bookings = db.relationship('Booking', backref='event', lazy=True)
    tickets = db.relationship('Ticket', backref='event', passive_deletes=True)
    def __repr__(self):
        return f'<Event {self.name}>'

class Ticket(db.Model):
    __tablename__ = 'tickets'
    ticket_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    event_id = db.Column(
        db.Integer,
        db.ForeignKey("events.event_id"),
        nullable=False
    )
    
    
    # Relationships
    booking_lines = db.relationship('BookingLine', backref='ticket', lazy=True)
    def __repr__(self):
        return f'<Ticket {self.name}>'