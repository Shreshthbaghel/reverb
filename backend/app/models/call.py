from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from datetime import datetime
from .base import Base


class CallLog(Base):
    """ORM model for call logs."""
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    caller_number = Column(String(20))
    call_start_time = Column(DateTime, nullable=False)
    call_end_time = Column(DateTime)
    duration_seconds = Column(Integer)
    transcript = Column(Text)
    status = Column(String(50), default="pending")
    success = Column(Boolean, default=False)
    agent_response_quality = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
