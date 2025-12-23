# Email sending utilities
# Re-export functions from mail module for convenience
from app.utils.mail.sender import send_otp_email, send_booking_confirmation_email

__all__ = [
    'send_otp_email',
    'send_booking_confirmation_email'
]
