from __future__ import annotations

from pydantic import BaseModel

from app.schemas.recipe import RecipeCandidate


class MealplanGenerateRequest(BaseModel):
    """Optional preferences for MVP; can be empty."""

    preferences: dict | None = None


class MealplanGenerateResponse(BaseModel):
    visible_candidates: list[RecipeCandidate]
    candidate_pool_size: int
