# app/utils/mail/sender.py

import os
import ssl
import smtplib
import datetime
from email.message import EmailMessage
from jinja2 import Template

from .otp_mail_template import OTP_EMAIL_TEMPLATE
from dotenv import load_dotenv
load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")


def send_otp_email(
    to_email: str,
    otp_code: str,
    user_name: str = "User",
    expiry_minutes: int = 5,
) -> None:
    if not SMTP_USER or not SMTP_PASS:
        raise RuntimeError("Missing SMTP credentials")

    html_body = Template(OTP_EMAIL_TEMPLATE).render(
        user_name=user_name,
        otp_code=otp_code,
        expiry_minutes=expiry_minutes,
        company_name="YourApp",
        year=datetime.datetime.now().year,
    )

    msg = EmailMessage()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = "Your One-Time Password (OTP)"

    # plain text fallback
    msg.set_content(
        f"Your OTP is {otp_code}. It expires in {expiry_minutes} minutes."
    )
    msg.add_alternative(html_body, subtype="html")

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)


def send_booking_confirmation_email(
    to_email: str,
    event_name: str,
    booking_id: int,
    user_name: str = "User",
) -> None:
    if not SMTP_USER or not SMTP_PASS:
        raise RuntimeError("Missing SMTP credentials")

    subject = f"Booking Confirmation for {event_name}"
    body = f"""
    Hello {user_name},

    Thank you for your booking!

    Your booking ID is {booking_id} for the event '{event_name}'.

    We look forward to seeing you there!

    Best regards,
    YourApp Team
    """

    msg = EmailMessage()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
