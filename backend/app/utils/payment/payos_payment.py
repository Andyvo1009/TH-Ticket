import uuid
from decimal import Decimal, ROUND_DOWN
from dotenv import load_dotenv
import os
from payos import PayOS
import time

load_dotenv()

client = PayOS(
    client_id=os.getenv("PAYOS_CLIENT_ID"),
    api_key=os.getenv("PAYOS_API_KEY"),
    checksum_key=os.getenv("PAYOS_CHECKSUM_KEY"),
)


def payos_setup(order_code, amount):
    try:
        amount = int(
            Decimal(str(amount))
            .quantize(Decimal("1"), rounding=ROUND_DOWN)
        )
        if amount <= 0:
            print(amount)
            raise ValueError("Amount must be positive")
    except (KeyError, ValueError) as exc:
        return None
    
    try:
        expired_at = int(time.time()) + 10 * 60

        payment_request = {
            "order_code": order_code,
            "amount": amount,
            "description": f"Thanh toan dat ve {order_code}",
            "cancel_url": "https://thticket.twilightparadox.com/cancel?order_code=" + str(order_code),
            "return_url": "https://thticket.twilightparadox.com/success?order_code=" + str(order_code),
            "expired_at": expired_at
        }
        return payment_request
    except Exception as exc:
        print("Error:", str(exc), flush=True)
        return None
