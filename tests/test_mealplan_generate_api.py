from datetime import date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.db.models import InventoryItem
from app.db.session import SessionLocal
from app.main import app

client = TestClient(app)


def _failing_search_recipes(self, preferences=None, limit=15):
    raise RuntimeError("provider unavailable")


def test_generate_returns_503_when_provider_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "app.services.recipe_provider.StubRecipeProvider.search_recipes",
        _failing_search_recipes,
    )
    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 503
    assert response.json() == {"error": "recipe_provider_unavailable"}


def test_generate_with_empty_inventory_returns_200_and_pool_size() -> None:
    response = client.post("/api/v1/mealplan/generate", json={})

    assert response.status_code == 200
    data = response.json()
    assert data["candidate_pool_size"] == 15
    assert len(data["visible_candidates"]) <= 15


def test_generate_with_expiring_item_ranks_matching_recipe_high() -> None:
    # Stub recipes all include "oat milk". Insert oat milk expiring in 1 day.
    tomorrow = date.today() + timedelta(days=1)
    with SessionLocal() as session:
        item = InventoryItem(
            item_id="expiring-oat",
            name="Oat Milk",
            quantity=1.0,
            created_at=datetime.utcnow(),
            location="fridge",
            storage_guidance="Refrigerate.",
            category="dairy_alt",
            is_staple=False,
            opened=False,
            expiration_date_estimated=tomorrow,
            expiration_date_user_override=tomorrow,
            expired_flag=False,
        )
        session.add(item)
        session.commit()

    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 200
    data = response.json()
    visible = data["visible_candidates"]
    assert len(visible) <= 15
    # At least one recipe in top results should use oat milk (stub recipes all do).
    ingredient_names = []
    for recipe in visible:
        for ing in recipe.get("ingredients", []):
            ingredient_names.append(ing.get("name", "").lower())
    assert "oat milk" in ingredient_names
    # Recipe using expiring oat milk should rank in top 1-2 (first two slots).
    assert len(visible) >= 1
    top_ingredients = []
    for recipe in visible[:2]:
        for ing in recipe.get("ingredients", []):
            top_ingredients.append(ing.get("name", "").lower())
    assert "oat milk" in top_ingredients


def test_generate_with_expired_item_returns_something() -> None:
    # Insert expired oat milk. Stub recipes use "oat milk" -> all become ineligible.
    # We fall back to the full pool so the client never gets an empty list.
    past = date.today() - timedelta(days=1)
    with SessionLocal() as session:
        item = InventoryItem(
            item_id="expired-oat",
            name="oat milk",
            quantity=1.0,
            created_at=datetime.utcnow(),
            location="fridge",
            storage_guidance="Refrigerate.",
            category="dairy_alt",
            is_staple=False,
            opened=False,
            expiration_date_estimated=past,
            expiration_date_user_override=past,
            expired_flag=True,
        )
        session.add(item)
        session.commit()

    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 200
    data = response.json()
    visible = data["visible_candidates"]
    # Fallback: when all candidates are ineligible (expired match), we still return up to 15
    # so the Discover screen is never empty.
    assert len(visible) <= 15
    assert data["candidate_pool_size"] == 15


def test_generate_with_user_recipes_includes_them_in_pool() -> None:
    # User-created recipe with milk and rice. Add matching inventory (not expired).
    tomorrow = date.today() + timedelta(days=2)
    with SessionLocal() as session:
        for name, iid in [("milk", "inv-milk"), ("rice", "inv-rice")]:
            item = InventoryItem(
                item_id=iid,
                name=name,
                quantity=1.0,
                created_at=datetime.utcnow(),
                location="fridge",
                storage_guidance="Keep cool.",
                category="dairy_alt" if name == "milk" else "grain",
                is_staple=False,
                opened=False,
                expiration_date_estimated=tomorrow,
                expiration_date_user_override=None,
                expired_flag=False,
            )
            session.add(item)
        session.commit()

    payload = {
        "user_recipes": [
            {
                "recipe_id": "my-rice-pudding",
                "title": "Rice Pudding",
                "servings": 2,
                "ingredients": [
                    {"name": "milk", "amount": 1, "unit": "cup"},
                    {"name": "rice", "amount": 0.5, "unit": "cup"},
                ],
                "instructions": ["Combine milk and rice.", "Simmer until done."],
            }
        ]
    }
    response = client.post("/api/v1/mealplan/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    visible = data["visible_candidates"]
    recipe_ids = [r["recipe_id"] for r in visible]
    # User recipe should be in the pool and, when it matches inventory, appear in visible.
    assert "my-rice-pudding" in recipe_ids
    assert data["candidate_pool_size"] == 16  # 15 stubs + 1 user recipe
