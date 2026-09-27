from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use PostgreSQL if available, else fall back to SQLite for local dev without Docker
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://voiceagent:password123@localhost:5432/voice_agent_db"
)

# SQLite fallback: set DATABASE_URL=sqlite:///./voice_agent.db in .env
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
