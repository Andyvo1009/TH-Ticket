import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-123456")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", 'postgresql://postgres:123@localhost:5432/ticket-booking')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-1234")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # AWS Configuration
    AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
    AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
    AWS_REGION = os.getenv("AWS_REGION")
    AWS_BUCKET = os.getenv("AWS_BUCKET")
    
    # Redis Configuration
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
    
    # Email Configuration
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")
    
    # Payment Gateway Configuration
    PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID")
    PAYOS_API_KEY = os.getenv("PAYOS_API_KEY")
    PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY")


class DevelopmentConfig(Config):
    """Development configuration"""
    ENV = 'development'
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    ENV = 'production'
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
