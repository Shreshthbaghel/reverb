from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..models.agent import Agent
from ..models.call import CallLog
from ..db import get_db

router = APIRouter(prefix="/api/agents", tags=["agents"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class AgentCreate(BaseModel):
    name: str
    system_prompt: str
    description: Optional[str] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    system_prompt: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class AgentResponse(BaseModel):
    id: int
    name: str
    system_prompt: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/", response_model=AgentResponse)
def create_agent(
    agent: AgentCreate,
    user_id: int = 1,  # In Phase 2, extract from JWT token
    db: Session = Depends(get_db)
):
    """Create a new voice agent."""
    new_agent = Agent(
        user_id=user_id,
        name=agent.name,
        system_prompt=agent.system_prompt,
        description=agent.description
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent


@router.get("/", response_model=List[AgentResponse])
def get_agents(
    user_id: int = 1,  # In Phase 2, extract from JWT token
    db: Session = Depends(get_db)
):
    """Get all agents for a user."""
    agents = db.query(Agent).filter(Agent.user_id == user_id).all()
    return agents


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Get a specific agent by ID."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: int,
    agent_update: AgentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing agent."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent_update.name is not None:
        agent.name = agent_update.name
    if agent_update.system_prompt is not None:
        agent.system_prompt = agent_update.system_prompt
    if agent_update.description is not None:
        agent.description = agent_update.description
    if agent_update.status is not None:
        agent.status = agent_update.status

    agent.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """Delete an agent and its call logs."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    db.query(CallLog).filter(CallLog.agent_id == agent_id).delete()
    db.delete(agent)
    db.commit()
    return {"message": "Agent deleted successfully"}


@router.get("/{agent_id}/calls")
def get_agent_calls(agent_id: int, db: Session = Depends(get_db)):
    """Get all call logs for a specific agent."""
    calls = db.query(CallLog).filter(CallLog.agent_id == agent_id).order_by(
        CallLog.call_start_time.desc()
    ).all()
    return calls
