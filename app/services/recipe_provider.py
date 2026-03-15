from __future__ import annotations

import logging
from typing import Protocol

from app.schemas.recipe import Ingredient, RecipeCandidate

logger = logging.getLogger(__name__)


class RecipeProvider(Protocol):
    def search_recipes(
        self,
        preferences: dict | None = None,
        limit: int = 15,
    ) -> list[RecipeCandidate]:
        ...


class LLMRecipeProvider:
    """
    Recipe provider that uses the LLM service to generate candidates.
    Falls back to the given fallback provider on missing config, errors, or invalid response.
    """

    def __init__(self, fallback: RecipeProvider) -> None:
        self._fallback = fallback

    def search_recipes(
        self,
        preferences: dict | None = None,
        limit: int = 15,
    ) -> list[RecipeCandidate]:
        from app.services.llm_service import generate_recipes

        context = None
        if preferences and isinstance(preferences.get("inventory_summary"), str):
            context = preferences["inventory_summary"]
        recipes = generate_recipes(context=context, limit=limit)
        if recipes and len(recipes) > 0:
            return recipes
        logger.info("LLM recipe provider falling back to stub provider")
        return self._fallback.search_recipes(preferences=preferences, limit=limit)


class StubRecipeProvider:
    def search_recipes(
        self,
        preferences: dict | None = None,
        limit: int = 15,
    ) -> list[RecipeCandidate]:
        # Deterministic hardcoded recipes; preferences are ignored for now.
        base_recipes: list[RecipeCandidate] = []

        for i in range(1, 21):
            base_recipes.append(
                RecipeCandidate(
                    recipe_id=f"stub-{i}",
                    title=f"Stub Recipe {i}",
                    servings=2 + (i % 4),
                    ingredients=[
                        Ingredient(name="oat milk", amount=1, unit="cup"),
                        Ingredient(name="pasta", amount=200, unit="g"),
                    ],
                    instructions=[
                        "Combine ingredients.",
                        "Cook until done.",
                    ],
                )
            )

        return base_recipes[:limit]

