from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..models.user import User
from ..db import get_db
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserRegister(BaseModel):
    email: str
    password: str
    name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash password (use bcrypt in production!)
    password_hash = hashlib.sha256(user.password.encode()).hexdigest()

    new_user = User(
        email=user.email,
        password_hash=password_hash,
        name=user.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    """User login - returns user info (add JWT in Phase 2)."""
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    password_hash = hashlib.sha256(user.password.encode()).hexdigest()
    if db_user.password_hash != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # In Phase 2: return JWT token here
    return {
        "id": db_user.id,
        "email": db_user.email,
        "name": db_user.name,
        "message": "Login successful"
    }
