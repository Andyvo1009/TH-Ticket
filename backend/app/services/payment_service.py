# Payment service - Business logic
from app.extensions import db
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.event import Ticket
from datetime import datetime
from decimal import Decimal, ROUND_DOWN
from app.utils.payment.payos_payment import payos_setup, client
from payos.types import CreatePaymentLinkRequest


class PaymentService:
    """Payment service for handling transactions"""
    
    @staticmethod
    def create_payos_payment(booking_id, amount, ticket_types):
        """Create a PayOS payment"""
        # Validate and prepare amount
        amount = int(Decimal(str(amount)).quantize(Decimal("1"), rounding=ROUND_DOWN))
        
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        if not ticket_types or not isinstance(ticket_types, list):
            raise ValueError("ticket_types must be a non-empty list")
        
        # Create payment record
        payment = Payment(
            booking_id=booking_id,
            amount=amount,
            payment_method="payos",
            payment_status="pending",
            transaction_id=booking_id + 10000
        )
        db.session.add(payment)
        
        # Lock tickets to prevent double booking
        ticket_ids = [t["ticket_id"] for t in ticket_types]
        tickets = (
            db.session.query(Ticket)
            .filter(Ticket.ticket_id.in_(ticket_ids))
            .with_for_update()
            .all()
        )
        
        ticket_map = {t.ticket_id: t for t in tickets}
        
        # Validate ticket quantities
        for item in ticket_types:
            ticket = ticket_map.get(item["ticket_id"])
            if not ticket:
                raise ValueError(f"Ticket {item['ticket_id']} not found")
            
            if ticket.quantity < item["quantity"]:
                raise ValueError(f"Not enough tickets for {ticket.name}")
        
        db.session.flush()
        
        # Prepare PayOS request
        order_code = booking_id + 10000
        payment_data = payos_setup(order_code, amount)
        payment_data = CreatePaymentLinkRequest(**payment_data)
        response = client.payment_requests.create(payment_data=payment_data)
        response = response.model_dump_camel_case()
        
        return {
            "payment_url": response.get("checkoutUrl"),
            "order_code": order_code
        }
    
    @staticmethod
    def success_payment(order_id):
        """Mark payment as successful and update ticket quantities"""
        payment = Payment.query.filter_by(transaction_id=order_id).first()
        if not payment:
            raise ValueError("Payment not found")
        
        # Idempotency check
        if payment.payment_status == "completed":
            return {
                "orderId": order_id,
                "status": "completed",
                "message": "Already processed"
            }
        
        payment.payment_status = "completed"
        payment.paid_at = datetime.utcnow()
        
        # Update ticket quantities
        booking = Booking.query.get(payment.booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        for line in booking.booking_lines:
            ticket = (
                db.session.query(Ticket)
                .filter_by(ticket_id=line.ticket_id)
                .with_for_update()
                .one()
            )
            ticket.quantity -= line.quantity
        
        # Update booking status
        booking.status = 'confirmed'
        db.session.commit()
        
        return {
            "orderId": order_id,
            "status": "completed"
        }
    
    @staticmethod
    def fail_payment(order_id):
        """Mark payment as failed"""
        payment = Payment.query.filter_by(transaction_id=order_id).first()
        if not payment:
            raise ValueError("Payment not found")
        
        payment.payment_status = "failed"
        db.session.commit()
        
        return {
            "orderId": order_id,
            "status": payment.payment_status
        }
    
    @staticmethod
    def process_payment(payment_id):
        """Process payment through gateway - to be implemented"""
        pass
    
    @staticmethod
    def get_payment_status(payment_id):
        """Get payment status - to be implemented"""
        pass
    
    @staticmethod
    def handle_webhook(data):
        """Handle payment gateway webhook - to be implemented"""
        pass
    
    @staticmethod
    def refund_payment(payment_id):
        """Refund a payment - to be implemented"""
        pass
