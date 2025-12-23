# Test cases for events
import pytest
from app import create_app
from app.extensions import db


@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


def test_get_events():
    """Test getting all events - to be implemented"""
    pass


def test_get_event():
    """Test getting single event - to be implemented"""
    pass


def test_create_event():
    """Test creating event - to be implemented"""
    pass


def test_update_event():
    """Test updating event - to be implemented"""
    pass


def test_delete_event():
    """Test deleting event - to be implemented"""
    pass
