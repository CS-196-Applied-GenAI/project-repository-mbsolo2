from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, String
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    item_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    location = Column(String, nullable=False)
    storage_guidance = Column(String, nullable=False)
    category = Column(String, nullable=False)
    is_staple = Column(Boolean, nullable=False, default=False)
    opened = Column(Boolean, nullable=False, default=False)
    expiration_date_estimated = Column(Date, nullable=False)
    expiration_date_user_override = Column(Date, nullable=True)
    expired_flag = Column(Boolean, nullable=False, default=False)


def init_db() -> None:
    from .engine import get_engine

    engine = get_engine()
    Base.metadata.create_all(bind=engine)

