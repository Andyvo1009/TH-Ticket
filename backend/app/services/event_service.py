# Event service - Business logic
from app.extensions import db
from app.models.event import Event, Ticket
from datetime import datetime
from sqlalchemy import text
import boto3
import os
from dotenv import load_dotenv
import uuid

load_dotenv()


def upload_file_to_s3(file, filename, acl="public-read"):
    """Upload file to AWS S3 bucket"""
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
        region_name=os.getenv("AWS_REGION")
    )
    filename = f"images/{filename}"
    BUCKET = os.getenv("AWS_BUCKET")
    s3.upload_fileobj(
        file,
        BUCKET,
        filename,
        ExtraArgs={
            "ContentType": file.content_type
        }
    )
    return f"https://{BUCKET}.s3.amazonaws.com/{filename}"


class EventService:
    """Event service for managing events"""
    
    @staticmethod
    def get_all_events(category=None, search=None, page=1, limit=10):
        """Get all approved events with filtering and pagination"""
        offset = (page - 1) * limit
        
        base_where = "WHERE e.approved = :approved"
        params = {
            "approved": "approved",
            "limit": limit,
            "offset": offset
        }
        
        if category:
            base_where += " AND e.category = :category"
            params["category"] = category
        
        if search:
            base_where += """
                AND (
                    unaccent(lower(e.name)) LIKE unaccent(lower(:search))
                    OR unaccent(lower(e.description)) LIKE unaccent(lower(:search))
                )
            """
            params["search"] = f"%{search}%"
        
        sql = text(f"""
            SELECT
                e.event_id as id,
                e.name as title,
                e.description,
                e.image_url as image,
                to_char(e.start_time, 'YYYY-MM-DD HH:MI AM') as date,
                e.venue_name as location,
                e.address,
                e.category,
                e.created_at,
                COALESCE(p.min_price, 0) AS price
            FROM events e
            LEFT JOIN (
                SELECT event_id, MIN(price) AS min_price
                FROM tickets
                GROUP BY event_id
            ) p ON p.event_id = e.event_id
            {base_where}
            LIMIT :limit OFFSET :offset
        """)
        
        result = db.session.execute(sql, params).mappings().all()
        result = [dict(row) for row in result]
        
        count_sql = text(f"""
            SELECT COUNT(*)
            FROM events e
            {base_where}
        """)
        
        total = db.session.execute(count_sql, params).scalar()
        total_pages = (total + limit - 1) // limit
        
        return {
            "success": True,
            "events": result,
            "total": total,
            "page": page,
            "totalPages": total_pages
        }, 200
    
    @staticmethod
    def get_my_events(user_id, page=1, limit=10):
        """Get events created by the current user"""
        offset = (page - 1) * limit
        
        sql = text("""
            SELECT
                e.event_id as id,
                e.name as title,
                e.description,
                e.image_url as image,
                to_char(e.start_time, 'YYYY-MM-DD HH:MI AM') as date,
                e.venue_name as location,
                e.address,
                e.category,
                e.approved,
                e.created_at,
                COALESCE(p.min_price, 0) AS price
            FROM events e
            LEFT JOIN (
                SELECT event_id, MIN(price) AS min_price
                FROM tickets
                GROUP BY event_id
            ) p ON p.event_id = e.event_id
            WHERE e.organizer_id = :user_id
            ORDER BY e.created_at DESC
            LIMIT :limit OFFSET :offset
        """)
        
        params = {
            "user_id": user_id,
            "limit": limit,
            "offset": offset
        }
        
        result = db.session.execute(sql, params).mappings().all()
        result = [dict(row) for row in result]
        
        count_sql = text("""
            SELECT COUNT(*)
            FROM events e
            WHERE e.organizer_id = :user_id
        """)
        
        total = db.session.execute(count_sql, {"user_id": user_id}).scalar()
        total_pages = (total + limit - 1) // limit
        
        return {
            "success": True,
            "events": result,
            "total": total,
            "page": page,
            "totalPages": total_pages
        }, 200
    
    @staticmethod
    def get_event_by_id(event_id):
        """Get single event by ID"""
        event = Event.query.filter(Event.approved == 'approved').filter_by(event_id=event_id).first()
        if not event:
            return {'success': False, 'message': 'Không tìm thấy sự kiện'}, 404
        
        event_data = {
            'id': event.event_id,
            'title': event.name,
            'description': event.description if event.description else '',
            'category': event.category if event.category else '',
            'date': event.start_time.date().isoformat() if event.start_time else '',
            'time': event.start_time.time().isoformat() if event.start_time else '',
            'location': event.venue_name if event.venue_name else '',
            'province': event.province if event.province else '',
            'district': event.district if event.district else '',
            'ward': event.ward if event.ward else '',
            'address': event.address if event.address else '',
            'image': event.image_url if event.image_url else '',
            'createdAt': event.created_at.isoformat() if event.created_at else None,
            'ticket_types': [{
                'id': ticket.ticket_id,
                'typeName': ticket.name,
                'price': float(ticket.price),
                'quantity': ticket.quantity
            } for ticket in event.tickets]
        }
        
        return {'success': True, 'event': event_data}, 200
    
    @staticmethod
    def create_event(user_id, data, file=None):
        """Create a new event"""
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', '').strip()
        date_str = data.get('date', '').strip()
        time_str = data.get('time', '').strip()
        location = data.get('location', '').strip()
        province = data.get('province', '').strip()
        district = data.get('district', '').strip()
        ward = data.get('ward', '').strip()
        address = data.get('address', '').strip()
        ticket_types = data.get('ticketTypes', [])
        
        if time_str:
            start_time = datetime.fromisoformat(f"{date_str}T{time_str}")
        else:
            start_time = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        
        # Create event
        new_event = Event(
            name=title,
            description=description,
            category=category,
            start_time=start_time,
            venue_name=location,
            province=province,
            district=district,
            ward=ward,
            address=address,
            image_url=None,
            organizer_id=user_id
        )
        db.session.add(new_event)
        db.session.flush()
        
        # Upload image if provided
        if file:
            ext = file.filename.rsplit(".", 1)[-1]
            filename = f"event_{new_event.event_id}.{ext}"
            image_url = upload_file_to_s3(file, filename)
            new_event.image_url = image_url
        
        # Add tickets
        for t in ticket_types:
            ticket = Ticket(
                name=t["typeName"],
                quantity=t["quantity"],
                price=t["price"],
                event_id=new_event.event_id
            )
            db.session.add(ticket)
        
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Tạo sự kiện thành công',
            'event': {
                'id': new_event.event_id,
                'title': new_event.name,
                'image': new_event.image_url
            }
        }, 201
    
    @staticmethod
    def update_event(event_id, data):
        """Update an event"""
        event = Event.query.get(event_id)
        if not event:
            return {'success': False, 'message': 'Không tìm thấy sự kiện'}, 404
        
        # Update fields if provided
        if 'title' in data:
            event.name = data['title'].strip()
        if 'description' in data:
            event.description = data['description'].strip()
        if 'category' in data:
            event.category = data['category'].strip()
        if 'date' in data and 'time' in data:
            date_str = data['date']
            time_str = data['time']
            event.start_time = datetime.fromisoformat(f"{date_str}T{time_str}")
        elif 'date' in data:
            date_str = data['date']
            event.start_time = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        if 'image' in data:
            event.image_url = data['image']
        
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Cập nhật sự kiện thành công',
            'event': {
                'id': event.event_id,
                'title': event.name,
            }
        }, 200
    
    @staticmethod
    def delete_event(event_id):
        """Delete an event"""
        event = Event.query.get(event_id)
        if not event:
            return {'success': False, 'message': 'Không tìm thấy sự kiện'}, 404
        
        db.session.delete(event)
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Xóa sự kiện thành công'
        }, 200
