# Input validation helpers
import re
from functools import wraps
from flask import request
from app.utils.response import error_response


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?1?\d{9,15}$'
    return re.match(pattern, phone) is not None


def validate_required_fields(required_fields):
    """Decorator to validate required fields in request data"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            if not data:
                return error_response("No data provided", 400)
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return error_response(
                    f"Missing required fields: {', '.join(missing_fields)}", 
                    400
                )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_data_types(field_types):
    """Decorator to validate data types of fields"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            errors = {}
            
            for field, expected_type in field_types.items():
                if field in data and not isinstance(data[field], expected_type):
                    errors[field] = f"Expected {expected_type.__name__}"
            
            if errors:
                return error_response("Invalid data types", 400, errors)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
