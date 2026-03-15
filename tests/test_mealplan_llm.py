"""
Tests for LLM-backed mealplan generation: fallback behavior, parsing, and API contract.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.recipe import Ingredient, RecipeCandidate

client = TestClient(app)


def test_fallback_when_no_llm_config(monkeypatch: pytest.MonkeyPatch) -> None:
    """When LLM is not configured, provider is stub; response is 200 with stub-like candidates."""
    monkeypatch.setattr("app.config.is_llm_recipe_provider_available", lambda: False)
    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 200
    data = response.json()
    assert "visible_candidates" in data
    assert "candidate_pool_size" in data
    assert data["candidate_pool_size"] == 15
    visible = data["visible_candidates"]
    assert len(visible) <= 15
    # Stub recipes have recipe_id stub-1, stub-2, ...
    recipe_ids = [r["recipe_id"] for r in visible]
    assert all(rid.startswith("stub-") for rid in recipe_ids)


def test_fallback_when_llm_returns_none(monkeypatch: pytest.MonkeyPatch) -> None:
    """When LLM is configured but generate_recipes returns None, fallback to stub."""
    monkeypatch.setattr("app.config.is_llm_recipe_provider_available", lambda: True)
    monkeypatch.setattr(
        "app.services.llm_service.generate_recipes",
        lambda context=None, limit=15: None,
    )
    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 200
    data = response.json()
    visible = data["visible_candidates"]
    assert len(visible) <= 15
    assert any(r["recipe_id"].startswith("stub-") for r in visible)


def test_valid_llm_response_used(monkeypatch: pytest.MonkeyPatch) -> None:
    """When LLM returns valid recipes, they appear in the response and are ranked."""
    llm_recipes = [
        RecipeCandidate(
            recipe_id="llm-1",
            title="LLM Pasta",
            servings=2,
            ingredients=[
                Ingredient(name="pasta", amount=200, unit="g"),
                Ingredient(name="tomato", amount=1, unit="cup"),
            ],
            instructions=["Boil pasta.", "Add tomato."],
        ),
        RecipeCandidate(
            recipe_id="llm-2",
            title="LLM Salad",
            servings=4,
            ingredients=[
                Ingredient(name="lettuce", amount=1, unit="head"),
            ],
            instructions=["Chop lettuce.", "Serve."],
        ),
    ]

    def fake_generate(context=None, limit=15):
        return llm_recipes

    monkeypatch.setattr("app.config.is_llm_recipe_provider_available", lambda: True)
    monkeypatch.setattr("app.services.llm_service.generate_recipes", fake_generate)
    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 200
    data = response.json()
    visible = data["visible_candidates"]
    recipe_ids = [r["recipe_id"] for r in visible]
    assert "llm-1" in recipe_ids or "llm-2" in recipe_ids
    assert data["candidate_pool_size"] == 2


def test_generate_endpoint_returns_expected_shape() -> None:
    """Response candidates have the shape expected by the frontend."""
    response = client.post("/api/v1/mealplan/generate", json={})
    assert response.status_code == 200
    data = response.json()
    for recipe in data["visible_candidates"]:
        assert "recipe_id" in recipe
        assert "title" in recipe
        assert "servings" in recipe
        assert "ingredients" in recipe
        assert "instructions" in recipe
        assert isinstance(recipe["ingredients"], list)
        assert isinstance(recipe["instructions"], list)
        for ing in recipe["ingredients"]:
            assert "name" in ing
            assert "amount" in ing
            assert "unit" in ing


def test_llm_parse_valid_json() -> None:
    """_parse_recipes converts valid JSON into RecipeCandidate list."""
    from app.services.llm_service import _parse_recipes

    raw = '{"recipes": [{"recipe_id": "r1", "title": "Test", "servings": 2, "ingredients": [{"name": "flour", "amount": 1, "unit": "cup"}], "instructions": ["Mix."]}]}'
    result = _parse_recipes(raw, limit=5)
    assert result is not None
    assert len(result) == 1
    assert result[0].recipe_id == "r1"
    assert result[0].title == "Test"
    assert result[0].servings == 2
    assert len(result[0].ingredients) == 1
    assert result[0].ingredients[0].name == "flour"
    assert result[0].instructions == ["Mix."]


def test_llm_parse_invalid_json_returns_none() -> None:
    """_parse_recipes returns None for invalid or malformed JSON."""
    from app.services.llm_service import _parse_recipes

    assert _parse_recipes("not json", limit=5) is None
    assert _parse_recipes("[]", limit=5) is None
    assert _parse_recipes('{"other": true}', limit=5) is None
    assert _parse_recipes('{"recipes": "not a list"}', limit=5) is None


def test_llm_parse_strips_markdown_fence() -> None:
    """_parse_recipes handles markdown code block wrapper."""
    from app.services.llm_service import _parse_recipes

    raw = '''```json
{"recipes": [{"recipe_id": "m1", "title": "Markdown", "servings": 2, "ingredients": [], "instructions": ["Step 1"]}]}
```'''
    result = _parse_recipes(raw, limit=5)
    assert result is not None
    assert len(result) == 1
    assert result[0].recipe_id == "m1"
    assert result[0].title == "Markdown"
