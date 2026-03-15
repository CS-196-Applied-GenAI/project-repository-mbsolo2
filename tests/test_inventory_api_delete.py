from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app


client = TestClient(app)


def test_delete_inventory_item_removes_it_from_list() -> None:
    payload = {
        "items": [
            {"name": "avocado", "quantity": 4},
        ]
    }

    # Create item via API
    post_resp = client.post("/api/v1/inventory", json=payload)
    assert post_resp.status_code == 200
    created_items = post_resp.json()
    assert len(created_items) == 1
    item_id = created_items[0]["item_id"]

    # Ensure it appears in GET /inventory
    get_resp = client.get("/api/v1/inventory")
    assert get_resp.status_code == 200
    items_before = get_resp.json()
    assert any(item["item_id"] == item_id for item in items_before)

    # DELETE the item
    delete_resp = client.delete(f"/api/v1/inventory/{item_id}")
    assert delete_resp.status_code == 204
    assert delete_resp.text == ""

    # Confirm it no longer appears
    get_after = client.get("/api/v1/inventory")
    assert get_after.status_code == 200
    items_after = get_after.json()
    assert all(item["item_id"] != item_id for item in items_after)

