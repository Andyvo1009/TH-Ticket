# Payment routes
from flask import Blueprint, request, jsonify, current_app
from app.services.payment_service import PaymentService
from app.extensions import db

payments_bp = Blueprint('payments', __name__, url_prefix='/api')


@payments_bp.route('/create-payment/payos', methods=['POST', 'OPTIONS'])
def create_payment():
    """Create a PayOS payment"""
    if request.method == 'OPTIONS':
        return '', 200

    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Invalid JSON payload"}), 400

    try:
        booking_id = int(payload["booking_id"])
        amount = payload["amount"]
        ticket_types = payload["ticket_type"]

        with db.session.begin():
            result = PaymentService.create_payos_payment(booking_id, amount, ticket_types)
        
        return jsonify(result), 200

    except (KeyError, ValueError, TypeError) as exc:
        print("Invalid payment request payload:", exc, flush=True)
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        current_app.logger.error("Ticket reservation failed: %s", exc)
        print("Ticket reservation failed:", exc, flush=True)
        return jsonify({"error": str(exc)}), 400


@payments_bp.route('/success-payment', methods=['POST', 'OPTIONS'])
def success_payment():
    """Handle successful payment"""
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    try:
        order_id = int(data['data']['orderCode'])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Invalid PayOS payload"}), 400

    try:
        result = PaymentService.success_payment(order_id)
        return jsonify(result), 200
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("Payment finalization failed")
        return jsonify({"error": str(exc)}), 500


@payments_bp.route('/fail-payment', methods=['POST', 'OPTIONS'])
def fail_payment():
    """Handle failed payment"""
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    
    try:
        order_id = data['data']['orderCode']
        result = PaymentService.fail_payment(order_id)
        return jsonify(result), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 404


@payments_bp.route('/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    """Get payment status - to be implemented"""
    pass


@payments_bp.route('/webhook', methods=['POST'])
def payment_webhook():
    """Payment webhook handler - to be implemented"""
    pass
