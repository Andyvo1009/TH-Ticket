# Event routes
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.services.event_service import EventService
from app.extensions import db
import json

events_bp = Blueprint('events', __name__, url_prefix='/api')


@events_bp.route('/events', methods=['GET'])
def get_events():
    """Get all events with filtering and pagination"""
    try:
        category = request.args.get('category')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        result, status_code = EventService.get_all_events(category, search, page, limit)
        return jsonify(result), status_code
    except Exception as exc:
        print("Error fetching events:", str(exc), flush=True)
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500


@events_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get single event by ID"""
    try:
        result, status_code = EventService.get_event_by_id(event_id)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching event: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy sự kiện: ' + str(e)}), 500


@events_bp.route('/events/my-events', methods=['GET'])
def get_my_events():
    """Get events created by the current user"""
    try:
        verify_jwt_in_request()
    except:
        return jsonify({'success': False, 'message': 'Cần đăng nhập để xem sự kiện của bạn'}), 401
    
    try:
        current_user_id = get_jwt_identity()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        result, status_code = EventService.get_my_events(current_user_id, page, limit)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error fetching my events: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi lấy sự kiện: ' + str(e)}), 500


@events_bp.route('/events', methods=['POST', 'OPTIONS'])
def create_event():
    """Create a new event"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        verify_jwt_in_request()
    except:
        return jsonify({'success': False, 'message': 'Cần đăng nhập để tạo sự kiện'}), 401

    try:
        current_user_id = get_jwt_identity()
        data = request.form.to_dict()
        file = request.files.get("image")
        
        # Parse ticket types from form data
        data['ticketTypes'] = json.loads(request.form.get("ticketTypes", "[]"))
        
        result, status_code = EventService.create_event(current_user_id, data, file)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print("Error:", str(e), flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi'}), 500


@events_bp.route('/events/<int:event_id>', methods=['PUT', 'OPTIONS'])
def update_event(event_id):
    """Update an event"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        verify_jwt_in_request()
    except Exception as e:
        return jsonify({'success': False, 'message': 'Cần đăng nhập để cập nhật sự kiện'}), 401
    
    current_user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        result, status_code = EventService.update_event(event_id, data)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print(f"Error updating event: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi cập nhật sự kiện: ' + str(e)}), 500


@events_bp.route('/events/<int:event_id>', methods=['DELETE', 'OPTIONS'])
def delete_event(event_id):
    """Delete an event"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        verify_jwt_in_request()
    except Exception as e:
        return jsonify({'success': False, 'message': 'Cần đăng nhập để xóa sự kiện'}), 401
    
    current_user_id = get_jwt_identity()
    
    try:
        result, status_code = EventService.delete_event(event_id)
        return jsonify(result), status_code
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting event: {str(e)}", flush=True)
        return jsonify({'success': False, 'message': 'Đã xảy ra lỗi khi xóa sự kiện: ' + str(e)}), 500
