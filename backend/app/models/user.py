from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base


class User(Base):
    """ORM model for platform users."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
