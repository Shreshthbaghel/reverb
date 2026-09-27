"""
Re-export Base from db module so models can import from here.
Single source of truth for the SQLAlchemy declarative base.
"""
from ..db import Base

__all__ = ["Base"]
