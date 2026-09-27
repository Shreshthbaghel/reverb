from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routes import agents, calls, auth
from .db import Base, engine, SessionLocal
from .models.user import User
from .models.agent import Agent  # noqa: F401 — register metadata
from .models.call import CallLog  # noqa: F401 — register metadata
from dotenv import load_dotenv

load_dotenv()


def seed_demo_user():
    """Ensure the Phase-1 demo user (id=1) exists for agent ownership."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "demo@voiceagent.com").first()
        if not existing:
            db.add(User(
                email="demo@voiceagent.com",
                password_hash="demo_hash_placeholder",
                name="Demo User",
            ))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed demo data."""
    Base.metadata.create_all(bind=engine)
    seed_demo_user()
    yield


app = FastAPI(
    title="Voice Agent Platform API",
    description="AI-powered voice agent management platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(calls.router)


@app.get("/")
def root():
    return {
        "message": "Voice Agent Platform API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "voice-agent-platform"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
