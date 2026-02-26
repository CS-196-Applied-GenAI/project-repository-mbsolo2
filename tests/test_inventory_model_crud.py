from datetime import date, datetime

from sqlalchemy import select

from app.db.models import InventoryItem
from app.db.session import SessionLocal


def test_inventory_item_crud_roundtrip() -> None:
    created_at = datetime.utcnow()
    expiration_estimated = date.today()

    with SessionLocal() as session:
        item = InventoryItem(
            item_id="item-1",
            name="oat milk",
            quantity=1.0,
            created_at=created_at,
            location="fridge",
            storage_guidance="Keep refrigerated",
            category="dairy_alt",
            is_staple=False,
            opened=False,
            expiration_date_estimated=expiration_estimated,
            expiration_date_user_override=None,
            expired_flag=False,
        )

        session.add(item)
        session.commit()

        retrieved = session.execute(
            select(InventoryItem).where(InventoryItem.item_id == "item-1")
        ).scalar_one()
        assert retrieved.name == "oat milk"
        assert retrieved.quantity == 1.0
        assert retrieved.location == "fridge"

        session.delete(retrieved)
        session.commit()

        remaining = session.execute(
            select(InventoryItem).where(InventoryItem.item_id == "item-1")
        ).scalar_one_or_none()
        assert remaining is None

