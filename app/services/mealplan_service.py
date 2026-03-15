from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy.orm import Session

from app.db.models import InventoryItem
from app.services.scoring import filter_ineligible, waste_score

if TYPE_CHECKING:
    from app.schemas.recipe import RecipeCandidate
    from app.services.recipe_provider import RecipeProvider


def generate_mealplan(
    session: Session,
    provider: "RecipeProvider",
    now: datetime | None = None,
    recipe_pool: list["RecipeCandidate"] | None = None,
) -> tuple[list["RecipeCandidate"], int]:
    """
    Load inventory, get recipes from provider (or use recipe_pool), filter ineligible, score, return top N.
    If recipe_pool is provided, it is used as the candidate pool (e.g. provider recipes + user_recipes).
    If after filtering all recipes are ineligible (e.g. all use expired items), we still return up to N
    from the full pool so the client never gets an empty list.
    Returns (visible_candidates, candidate_pool_size). Visible count is 15 so Discover gets a mix of LLM/stub and user recipes.
    """
    if now is None:
        now = datetime.utcnow()

    inventory_items: list[InventoryItem] = list(session.query(InventoryItem).all())
    if recipe_pool is not None:
        pool = list(recipe_pool)
    else:
        preferences: dict | None = None
        if inventory_items:
            preferences = {
                "inventory_summary": ", ".join(item.name for item in inventory_items[:50]),
            }
        pool = provider.search_recipes(preferences=preferences, limit=15)
    candidate_pool_size = len(pool)

    eligible = filter_ineligible(pool, inventory_items, now)
    if not eligible:
        eligible = pool
    scored = [(r, waste_score(r, inventory_items, now)) for r in eligible]
    scored.sort(key=lambda x: -x[1])
    visible_count = 15
    visible = [r for r, _ in scored[:visible_count]]

    return visible, candidate_pool_size
