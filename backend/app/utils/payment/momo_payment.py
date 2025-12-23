
import hmac
import hashlib
import uuid
from decimal import Decimal, ROUND_DOWN


def momo_setup(amount):
    try:
        amount = int(
            Decimal(str(amount))
            .quantize(Decimal("1"), rounding=ROUND_DOWN)
        )
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (KeyError, ValueError) as exc:
        return None
    
    endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
    accessKey = "F8BBA842ECF85"
    secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
    redirectUrl = "localhost:5173/my-bookings"
    ipnUrl = "localhost:5000/api/check-payment"
    requestId = str(uuid.uuid4())
    orderId = str(uuid.uuid4())
    requestType = "captureWallet"
    orderInfo = f"Thanh toan mua ve ({orderId})"
    rawSignature = "accessKey=" + accessKey + "&amount=" + str(amount) + "&extraData=" + "" + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + 'MOMO' + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + "captureWallet"    
    h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
    signature = h.hexdigest()
    
    payment_request = {
        'partnerCode': 'MOMO',
        'partnerName': "Test",
        'storeId': "MomoTestStore",
        'requestId': requestId,
        'amount': amount,
        'orderId': orderId,
        'orderInfo': orderInfo,
        'redirectUrl': redirectUrl,
        'ipnUrl': ipnUrl,
        'lang': "vi",
        'extraData': "",
        'requestType': requestType,
        'signature': signature
    }
    
    return payment_request
