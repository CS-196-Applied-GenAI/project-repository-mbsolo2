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
) -> tuple[list["RecipeCandidate"], int]:
    """
    Load inventory, get recipes from provider, filter ineligible, score, return top 5.
    Returns (visible_candidates, candidate_pool_size).
    """
    if now is None:
        now = datetime.utcnow()

    inventory_items: list[InventoryItem] = list(session.query(InventoryItem).all())
    pool = provider.search_recipes(limit=15)
    candidate_pool_size = len(pool)

    eligible = filter_ineligible(pool, inventory_items, now)
    scored = [(r, waste_score(r, inventory_items, now)) for r in eligible]
    scored.sort(key=lambda x: -x[1])
    visible = [r for r, _ in scored[:5]]

    return visible, candidate_pool_size
