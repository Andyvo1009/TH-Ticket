# Payment model
from app.extensions import db
from datetime import datetime


class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'), nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)
    payment_status = db.Column(db.Enum('pending', 'completed', 'failed', name='payment_status'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Payment {self.id}>'

class Cancellation(db.Model):
    __tablename__ = 'cancellations'
    cancel_id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'), nullable=False)
    cancelled_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    refund_amount = db.Column(db.Numeric(10, 2), nullable=True)
    reason = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return f'<Cancellation {self.id}>'