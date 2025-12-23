
from dotenv import load_dotenv
import os
from payos import PayOS
from payos.types import CreatePaymentLinkRequest
import time
load_dotenv()
client = PayOS(
    client_id=os.getenv("PAYOS_CLIENT_ID"),
    api_key=os.getenv("PAYOS_API_KEY"),
    checksum_key=os.getenv("PAYOS_CHECKSUM_KEY"),

)
result=client.webhooks.confirm(
    "https://thticket.twilightparadox.com/"
)


print(result)


