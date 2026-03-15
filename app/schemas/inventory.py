from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class InventoryCreateItem(BaseModel):
    name: str
    quantity: float
    """Optional user override for expiration (YYYY-MM-DD). When omitted, backend estimates."""
    expiration_date: date | None = None
    """Optional category (e.g. dairy, produce). When omitted, backend infers from name."""
    category: str | None = None


class InventoryCreateRequest(BaseModel):
    items: list[InventoryCreateItem]


class InventoryItemOut(BaseModel):
    item_id: str
    name: str
    quantity: float
    created_at: datetime
    location: str
    category: str
    storage_guidance: str
    expiration_date_estimated: date
    expiration_date_user_override: date | None
    expired_flag: bool

    class Config:
        from_attributes = True

