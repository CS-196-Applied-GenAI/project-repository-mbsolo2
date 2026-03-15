from __future__ import annotations

from pydantic import BaseModel

from app.schemas.recipe import RecipeCandidate


class MealplanGenerateRequest(BaseModel):
    """Optional preferences for MVP; can be empty."""

    preferences: dict | None = None
    """User-created recipes from the client; merged with provider pool for scoring."""
    user_recipes: list[RecipeCandidate] | None = None


class MealplanGenerateResponse(BaseModel):
    visible_candidates: list[RecipeCandidate]
    candidate_pool_size: int
