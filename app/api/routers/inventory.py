from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import InventoryItem
from app.db.session import get_db
from app.schemas.inventory import InventoryCreateRequest, InventoryItemOut
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


@router.get("", response_model=list[InventoryItemOut])
def list_inventory_items(
    db: Session = Depends(get_db),
) -> list[InventoryItemOut]:
    items = db.query(InventoryItem).all()
    return items


@router.delete("/{item_id}", status_code=204)
def delete_inventory_item(
    item_id: str,
    db: Session = Depends(get_db),
) -> None:
    service = InventoryService(db)
    service.delete_item(item_id)

