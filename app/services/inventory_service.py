from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.models import InventoryItem
from app.services.classifiers import (
    infer_category,
    infer_location,
    infer_storage_guidance,
)
from app.services.expiration_service import (
    effective_expiration,
    estimate_expiration,
    is_expired,
)


@dataclass
class InventoryInput:
    name: str
    quantity: float


class InventoryService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add_items(self, items: list[dict[str, Any]]) -> list[InventoryItem]:
        created_at = datetime.utcnow()
        created_items: list[InventoryItem] = []

        for raw in items:
            name = str(raw["name"])
            quantity = float(raw["quantity"])

            category = infer_category(name)
            location = infer_location(name)
            guidance = infer_storage_guidance(name, category)

            opened = False
            is_staple = False

            estimated_expiration = estimate_expiration(
                created_at=created_at,
                category=category,
                opened=opened,
            )
            effective = effective_expiration(
                estimated=estimated_expiration,
                override=None,
            )
            expired = is_expired(effective, now=created_at)

            item = InventoryItem(
                item_id=str(uuid4()),
                name=name,
                quantity=quantity,
                created_at=created_at,
                location=location,
                storage_guidance=guidance,
                category=category,
                is_staple=is_staple,
                opened=opened,
                expiration_date_estimated=estimated_expiration,
                expiration_date_user_override=None,
                expired_flag=expired,
            )

            self.session.add(item)
            created_items.append(item)

        self.session.commit()

        for item in created_items:
            self.session.refresh(item)

        return created_items

