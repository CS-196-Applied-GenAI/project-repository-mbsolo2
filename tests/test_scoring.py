from datetime import date, datetime, timedelta

from app.db.models import InventoryItem
from app.schemas.recipe import Ingredient, RecipeCandidate
from app.services.scoring import (
    filter_ineligible,
    match_inventory,
    urgency_points,
    waste_score,
)


def make_inventory_item(
    name: str,
    effective_in_days: int,
    item_id: str = "item-1",
) -> InventoryItem:
    created_at = datetime(2024, 1, 1, 8, 0, 0)
    effective_date = created_at.date() + timedelta(days=effective_in_days)
    return InventoryItem(
        item_id=item_id,
        name=name,
        quantity=1.0,
        created_at=created_at,
        location="fridge",
        storage_guidance="Keep refrigerated.",
        category="dairy_alt",
        is_staple=False,
        opened=False,
        expiration_date_estimated=effective_date,
        expiration_date_user_override=None,
        expired_flag=False,
    )


def test_urgency_points_bucket_mapping() -> None:
    assert urgency_points(0) == 5
    assert urgency_points(1) == 5
    assert urgency_points(2) == 3
    assert urgency_points(3) == 3
    assert urgency_points(4) == 1
    assert urgency_points(7) == 1
    assert urgency_points(8) == 0
    assert urgency_points(20) == 0


def test_match_inventory_oat_milk_matches_brand_name() -> None:
    items = [make_inventory_item("Chobani Oat Milk", effective_in_days=5)]

    matched = match_inventory("oat milk", items)

    assert matched is not None
    assert matched.name == "Chobani Oat Milk"


def test_waste_score_higher_for_items_expiring_sooner() -> None:
    now = datetime(2024, 1, 1, 12, 0, 0)

    recipe = RecipeCandidate(
        recipe_id="r1",
        title="Milk Smoothie",
        servings=1,
        ingredients=[Ingredient(name="milk", amount=1, unit="cup")],
        instructions=["Blend ingredients."],
    )

    items_soon = [make_inventory_item("milk", effective_in_days=1)]
    items_later = [make_inventory_item("milk", effective_in_days=10)]

    score_soon = waste_score(recipe, items_soon, now)
    score_later = waste_score(recipe, items_later, now)

    assert score_soon > score_later


def test_filter_ineligible_removes_recipes_using_expired_items() -> None:
    now = datetime(2024, 1, 10, 12, 0, 0)

    expired_item = make_inventory_item("oat milk", effective_in_days=-1, item_id="expired-1")

    recipes = [
        RecipeCandidate(
            recipe_id="uses-expired",
            title="Oat Milk Latte",
            servings=1,
            ingredients=[Ingredient(name="oat milk", amount=1, unit="cup")],
            instructions=["Combine and serve."],
        ),
        RecipeCandidate(
            recipe_id="safe",
            title="Pasta Dish",
            servings=2,
            ingredients=[Ingredient(name="pasta", amount=200, unit="g")],
            instructions=["Boil pasta."],
        ),
    ]

    filtered = filter_ineligible(recipes, [expired_item], now)

    ids = {r.recipe_id for r in filtered}
    assert "uses-expired" not in ids
    assert "safe" in ids

