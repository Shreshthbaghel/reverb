from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from ..models.agent import Agent
from ..models.call import CallLog
from ..db import get_db
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/agents", tags=["agents"])

FRONTEND_BASE = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")


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


class AgentPublic(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str

    class Config:
        from_attributes = True


class GeneratePromptRequest(BaseModel):
    description: str = Field(..., min_length=10)
    name: Optional[str] = None
    tone: Optional[str] = "professional, clear, and helpful"


class GeneratePromptResponse(BaseModel):
    system_prompt: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    reply: str
    history: List[ChatMessage]


class EmbedSnippetResponse(BaseModel):
    agent_id: int
    embed_url: str
    script_tag: str
    iframe_tag: str


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/generate-prompt", response_model=GeneratePromptResponse)
def generate_prompt(payload: GeneratePromptRequest):
    """Generate a master system prompt from a short description via Groq."""
    try:
        prompt = ai_service.generate_system_prompt(
            description=payload.description,
            name=payload.name,
            tone=payload.tone,
        )
        return GeneratePromptResponse(system_prompt=prompt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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


@router.get("/{agent_id}/public", response_model=AgentPublic)
def get_agent_public(agent_id: int, db: Session = Depends(get_db)):
    """Public agent metadata for embed widgets (no system prompt)."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.status != "active":
        raise HTTPException(status_code=403, detail="Agent is not active")
    return agent


@router.post("/{agent_id}/chat", response_model=ChatResponse)
def chat_with_agent(
    agent_id: int,
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    """Public chat endpoint used by the embeddable widget."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.status != "active":
        raise HTTPException(status_code=403, detail="Agent is not active")

    history = [
        {"role": m.role, "content": m.content}
        for m in (payload.history or [])
        if m.role in ("user", "assistant") and m.content.strip()
    ][-12:]

    try:
        reply, updated = ai_service.generate_response(
            system_prompt=agent.system_prompt,
            user_message=payload.message.strip(),
            conversation_history=history,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ChatResponse(
        reply=reply,
        history=[ChatMessage(role=m["role"], content=m["content"]) for m in updated],
    )


@router.get("/{agent_id}/embed", response_model=EmbedSnippetResponse)
def get_embed_snippet(agent_id: int, db: Session = Depends(get_db)):
    """Return HTML snippets to embed this agent on any site."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    embed_url = f"{FRONTEND_BASE.rstrip('/')}/embed/{agent_id}"
    script_src = f"{FRONTEND_BASE.rstrip('/')}/embed.js"
    script_tag = (
        f'<script src="{script_src}" data-agent-id="{agent_id}" '
        f'data-base="{FRONTEND_BASE.rstrip("/")}" '
        f'data-api="{API_BASE.rstrip("/")}" async></script>'
    )
    iframe_tag = (
        f'<iframe src="{embed_url}" title="{agent.name} agent" '
        f'width="380" height="560" style="border:0;border-radius:14px;'
        f'box-shadow:0 12px 40px rgba(0,0,0,.18);" '
        f'allow="clipboard-write"></iframe>'
    )
    return EmbedSnippetResponse(
        agent_id=agent_id,
        embed_url=embed_url,
        script_tag=script_tag,
        iframe_tag=iframe_tag,
    )


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
