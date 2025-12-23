# app/utils/mail/otp_mail_template.py

OTP_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your OTP Code</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 32px;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }
        .header h1 {
            font-size: 20px;
            margin: 0;
            color: #111827;
        }
        .content p {
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            margin: 12px 0;
        }
        .otp-box {
            margin: 24px 0;
            text-align: center;
        }
        .otp {
            display: inline-block;
            padding: 16px 24px;
            font-size: 28px;
            letter-spacing: 6px;
            font-weight: bold;
            color: #111827;
            background-color: #f3f4f6;
            border-radius: 6px;
        }
        .footer {
            margin-top: 32px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Identity</h1>
        </div>

        <div class="content">
            <p>Hello {{user_name}},</p>

            <p>
                We received a request to verify your account. Please use the
                one-time password (OTP) below to continue:
            </p>

            <div class="otp-box">
                <div class="otp">{{otp_code}}</div>
            </div>

            <p>
                This OTP is valid for <strong>{{expiry_minutes}} minutes</strong>.
                Do not share this code with anyone.
            </p>

            <p>
                If you did not request this verification, please ignore this email.
                No further action is required.
            </p>
        </div>

        <div class="footer">
            <p>
                © {{year}} {{company_name}}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
"""
