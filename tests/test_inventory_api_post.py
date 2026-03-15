from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_post_inventory_creates_items_and_returns_them() -> None:
    payload = {
        "items": [
            {"name": "avocado", "quantity": 4},
            {"name": "oat milk", "quantity": 1},
        ]
    }

    response = client.post("/api/v1/inventory", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 2

    for src, item in zip(payload["items"], data):
        assert "item_id" in item and item["item_id"]
        assert item["name"] == src["name"]
        assert item["quantity"] == float(src["quantity"])
        assert item["location"] in {"fridge", "pantry", "freezer", "unknown"}
        assert item["category"] is not None
        assert "expired_flag" in item
