from app.db.session import SessionLocal
from app.services.inventory_service import InventoryService


def test_inventory_service_add_items_sets_fields_and_flags() -> None:
    items = [
        {"name": "pasta", "quantity": 2},
        {"name": "oat milk", "quantity": 1},
    ]

    with SessionLocal() as session:
        service = InventoryService(session)
        created = service.add_items(items)

    assert len(created) == 2

    for src, item in zip(items, created):
        assert item.item_id
        assert item.created_at is not None
        assert item.name == src["name"]
        assert item.quantity == float(src["quantity"])

        # Classifier-derived fields
        assert item.location in {"fridge", "pantry", "freezer", "unknown"}
        assert item.category != "unknown"
        assert isinstance(item.storage_guidance, str)
        assert item.storage_guidance

        # Expiration fields
        assert item.expiration_date_estimated is not None
        assert item.expiration_date_user_override is None
        assert item.expired_flag is False

