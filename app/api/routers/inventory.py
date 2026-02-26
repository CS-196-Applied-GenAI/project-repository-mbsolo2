from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.inventory import (
    InventoryCreateRequest,
    InventoryItemOut,
)
from app.services.inventory_service import InventoryService


router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


@router.post("", response_model=list[InventoryItemOut])
def create_inventory_items(
    payload: InventoryCreateRequest,
    db: Session = Depends(get_db),
) -> list[InventoryItemOut]:
    service = InventoryService(db)
    items = service.add_items(
        [{"name": item.name, "quantity": item.quantity} for item in payload.items]
    )
    return items

