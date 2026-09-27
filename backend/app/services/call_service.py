from ..models.call import CallLog
from sqlalchemy.orm import Session
from datetime import datetime


class CallService:
    """Service for call log management and analytics."""

    @staticmethod
    def log_call(
        db: Session,
        agent_id: int,
        caller_number: str,
        transcript: str,
        duration_seconds: int,
        success: bool = True,
        quality_score: float = 0.85
    ) -> CallLog:
        """Log a completed call to the database."""
        call = CallLog(
            agent_id=agent_id,
            caller_number=caller_number,
            call_start_time=datetime.utcnow(),
            call_end_time=datetime.utcnow(),
            duration_seconds=duration_seconds,
            transcript=transcript,
            status="completed",
            success=success,
            agent_response_quality=quality_score
        )

        db.add(call)
        db.commit()
        db.refresh(call)

        return call

    @staticmethod
    def get_agent_statistics(db: Session, agent_id: int) -> dict:
        """Get aggregated statistics for a specific agent."""
        calls = db.query(CallLog).filter(CallLog.agent_id == agent_id).all()

        if not calls:
            return {
                "total_calls": 0,
                "success_rate": 0,
                "avg_duration": 0,
                "avg_quality": 0
            }

        successful = sum(1 for c in calls if c.success)
        total_duration = sum(c.duration_seconds or 0 for c in calls)
        avg_quality = sum(c.agent_response_quality or 0 for c in calls) / len(calls)

        return {
            "total_calls": len(calls),
            "success_rate": (successful / len(calls)) * 100,
            "avg_duration": total_duration / len(calls) if calls else 0,
            "avg_quality": avg_quality
        }

    @staticmethod
    def get_platform_statistics(db: Session) -> dict:
        """Get aggregated statistics across all calls on the platform."""
        all_calls = db.query(CallLog).all()

        if not all_calls:
            return {
                "total_calls": 0,
                "success_rate": 0,
                "avg_duration": 0,
                "avg_quality": 0
            }

        successful = sum(1 for c in all_calls if c.success)
        total_duration = sum(c.duration_seconds or 0 for c in all_calls)
        avg_quality = sum(c.agent_response_quality or 0 for c in all_calls) / len(all_calls)

        return {
            "total_calls": len(all_calls),
            "success_rate": (successful / len(all_calls)) * 100,
            "avg_duration": total_duration / len(all_calls) if all_calls else 0,
            "avg_quality": avg_quality
        }
