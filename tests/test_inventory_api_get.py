from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.db.models import InventoryItem
from app.db.session import SessionLocal
from app.main import app


client = TestClient(app)


def test_get_inventory_returns_posted_item() -> None:
    payload = {
        "items": [
            {"name": "avocado", "quantity": 4},
        ]
    }

    post_resp = client.post("/api/v1/inventory", json=payload)
    assert post_resp.status_code == 200

    get_resp = client.get("/api/v1/inventory")
    assert get_resp.status_code == 200

    items = get_resp.json()
    assert isinstance(items, list)
    assert any(item["name"] == "avocado" for item in items)


def test_get_inventory_shows_expired_flag_when_override_in_past() -> None:
    # Insert an item directly via ORM with an override date in the past
    with SessionLocal() as session:
        item = InventoryItem(
            item_id="expired-1",
            name="leftover soup",
            quantity=1.0,
            created_at=date.today(),
            location="fridge",
            storage_guidance="Refrigerate.",
            category="protein",
            is_staple=False,
            opened=True,
            expiration_date_estimated=date.today() - timedelta(days=1),
            expiration_date_user_override=date.today() - timedelta(days=2),
            expired_flag=True,
        )
        session.add(item)
        session.commit()

    resp = client.get("/api/v1/inventory")
    assert resp.status_code == 200

    items = resp.json()
    expired_items = [i for i in items if i["item_id"] == "expired-1"]
    assert expired_items, "Expected to find the expired item by item_id"
    assert expired_items[0]["expired_flag"] is True

