from __future__ import annotations

from typing import Protocol

from app.schemas.recipe import Ingredient, RecipeCandidate


class RecipeProvider(Protocol):
    def search_recipes(
        self,
        preferences: dict | None = None,
        limit: int = 15,
    ) -> list[RecipeCandidate]:
        ...


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

