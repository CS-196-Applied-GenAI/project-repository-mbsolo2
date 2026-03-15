from __future__ import annotations

from datetime import date, datetime
from typing import Iterable, Optional

from app.db.models import InventoryItem
from app.schemas.recipe import RecipeCandidate
from app.services.expiration_service import effective_expiration, is_expired


def urgency_points(days: int) -> int:
    if days <= 1:
        return 5
    if days <= 3:
        return 3
    if 4 <= days <= 7:
        return 1
    return 0


def _tokens(text: str) -> set[str]:
    return {t for t in text.lower().replace(",", " ").split() if t}


def match_inventory(
    ingredient_name: str,
    items: Iterable[InventoryItem],
) -> Optional[InventoryItem]:
    """
    Match an ingredient name to an inventory item using simple
    lowercased token overlap / substring logic.
    """
    ingredient_tokens = _tokens(ingredient_name)
    ingredient_lower = ingredient_name.lower()

    # Prefer token overlap matches
    for item in items:
        name_lower = item.name.lower()
        name_tokens = _tokens(item.name)
        if ingredient_tokens & name_tokens:
            return item

    # Fallback to substring-based matching
    for item in items:
        name_lower = item.name.lower()
        if ingredient_lower in name_lower or name_lower in ingredient_lower:
            return item

    return None


def _effective_expiration_for_item(item: InventoryItem) -> Optional[date]:
    return effective_expiration(
        estimated=item.expiration_date_estimated,
        override=item.expiration_date_user_override,
    )


def waste_score(
    recipe: RecipeCandidate,
    inventory_items: list[InventoryItem],
    now: datetime,
) -> int:
    """
    Higher score means we are using items that expire sooner.
    """
    total = 0
    today = now.date()

    for ingredient in recipe.ingredients:
        item = match_inventory(ingredient.name, inventory_items)
        if item is None:
            continue

        eff = _effective_expiration_for_item(item)
        if eff is None:
            continue

        if is_expired(eff, now):
            # Expired items will be filtered elsewhere; do not contribute to score.
            continue

        days_until_expiration = (eff - today).days
        if days_until_expiration < 0:
            days_until_expiration = 0

        total += urgency_points(days_until_expiration)

    return total


def filter_ineligible(
    recipes: list[RecipeCandidate],
    inventory_items: list[InventoryItem],
    now: datetime,
) -> list[RecipeCandidate]:
    """
    Remove recipes that use any expired inventory item.
    """
    eligible: list[RecipeCandidate] = []

    for recipe in recipes:
        exclude = False
        for ingredient in recipe.ingredients:
            item = match_inventory(ingredient.name, inventory_items)
            if item is None:
                continue

            eff = _effective_expiration_for_item(item)
            if eff is None:
                continue

            if is_expired(eff, now):
                exclude = True
                break

        if not exclude:
            eligible.append(recipe)

    return eligible

