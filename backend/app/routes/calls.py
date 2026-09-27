from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..models.call import CallLog
from ..models.agent import Agent
from ..db import get_db
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/calls", tags=["calls"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class CallCreate(BaseModel):
    agent_id: int
    caller_number: str
    transcript: str
    duration_seconds: int = 0
    success: bool = True


class CallLogResponse(BaseModel):
    id: int
    agent_id: int
    caller_number: Optional[str]
    call_start_time: datetime
    call_end_time: Optional[datetime]
    duration_seconds: Optional[int]
    transcript: Optional[str]
    status: Optional[str]
    success: Optional[bool]
    agent_response_quality: Optional[float]

    class Config:
        from_attributes = True


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/", response_model=CallLogResponse)
def create_call_log(call: CallCreate, db: Session = Depends(get_db)):
    """Log a completed call and optionally score the transcript via Groq."""
    agent = db.query(Agent).filter(Agent.id == call.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    call_time = datetime.utcnow()
    analysis = ai_service.analyze_transcript(call.transcript) if call.transcript else {
        "quality_score": 0.0,
        "summary": "",
        "sentiment": "neutral",
    }

    new_call = CallLog(
        agent_id=call.agent_id,
        caller_number=call.caller_number,
        call_start_time=call_time,
        call_end_time=call_time,
        duration_seconds=call.duration_seconds,
        transcript=call.transcript,
        status="completed",
        success=call.success,
        agent_response_quality=analysis.get("quality_score", 0.75),
    )
    db.add(new_call)
    db.commit()
    db.refresh(new_call)
    return new_call


@router.get("/", response_model=List[CallLogResponse])
def get_all_calls(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all call logs with pagination."""
    calls = db.query(CallLog).order_by(
        CallLog.call_start_time.desc()
    ).offset(skip).limit(limit).all()
    return calls


@router.get("/analytics/{agent_id}")
def get_call_analytics(agent_id: int, db: Session = Depends(get_db)):
    """Get analytics summary for a specific agent."""
    calls = db.query(CallLog).filter(CallLog.agent_id == agent_id).all()

    if not calls:
        return {
            "total_calls": 0,
            "completed_calls": 0,
            "success_rate": 0,
            "total_duration_seconds": 0,
            "avg_call_duration": 0,
            "avg_response_quality": 0
        }

    total_calls = len(calls)
    completed_calls = sum(1 for c in calls if c.status == "completed")
    total_duration = sum(c.duration_seconds or 0 for c in calls)
    avg_quality = sum(c.agent_response_quality or 0 for c in calls) / total_calls

    return {
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "success_rate": (completed_calls / total_calls * 100) if total_calls > 0 else 0,
        "total_duration_seconds": total_duration,
        "avg_call_duration": total_duration / total_calls if total_calls > 0 else 0,
        "avg_response_quality": avg_quality
    }


@router.get("/{call_id}", response_model=CallLogResponse)
def get_call(call_id: int, db: Session = Depends(get_db)):
    """Get details of a specific call."""
    call = db.query(CallLog).filter(CallLog.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.delete("/{call_id}")
def delete_call(call_id: int, db: Session = Depends(get_db)):
    """Delete a call log by ID."""
    call = db.query(CallLog).filter(CallLog.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    db.delete(call)
    db.commit()
    return {"message": "Call log deleted successfully"}
