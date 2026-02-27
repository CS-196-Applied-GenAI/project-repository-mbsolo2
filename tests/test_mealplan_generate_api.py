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
    assert len(data["visible_candidates"]) <= 5


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
    assert len(visible) <= 5
    # At least one recipe in top 5 should use oat milk (stub recipes all do).
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


def test_generate_with_expired_item_excludes_matching_recipe() -> None:
    # Insert expired oat milk. Stub recipes use "oat milk" -> all become ineligible.
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
    # Recipes that use expired oat milk must be filtered out. All stubs use oat milk.
    for recipe in visible:
        for ing in recipe.get("ingredients", []):
            assert ing.get("name", "").lower() != "oat milk", (
                "Recipe using expired oat milk should not appear"
            )
