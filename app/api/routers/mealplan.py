from __future__ import annotations

import logging

from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import is_llm_recipe_provider_available
from app.db.session import get_db
from app.schemas.mealplan import (
    MealplanGenerateRequest,
    MealplanGenerateResponse,
)
from app.services.mealplan_service import generate_mealplan
from app.services.recipe_provider import LLMRecipeProvider, StubRecipeProvider

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/mealplan", tags=["mealplan"])


def _get_recipe_provider() -> StubRecipeProvider | LLMRecipeProvider:
    """Use LLM provider when configured and enabled; otherwise stub. Fallback is handled inside LLMRecipeProvider."""
    stub = StubRecipeProvider()
    if is_llm_recipe_provider_available():
        return LLMRecipeProvider(fallback=stub)
    return stub


@router.post("/generate", response_model=MealplanGenerateResponse)
def post_generate_mealplan(
    payload: MealplanGenerateRequest | None = Body(None),
    db: Session = Depends(get_db),
) -> MealplanGenerateResponse | JSONResponse:
    provider = _get_recipe_provider()
    recipe_pool = None
    if payload and payload.user_recipes is not None and len(payload.user_recipes) > 0:
        base = provider.search_recipes(limit=15)
        recipe_pool = list(base) + list(payload.user_recipes)
    try:
        visible, candidate_pool_size = generate_mealplan(db, provider, recipe_pool=recipe_pool)
    except Exception as e:
        logger.warning("Recipe provider failed: %s", e, exc_info=True)
        return JSONResponse(
            status_code=503,
            content={"error": "recipe_provider_unavailable"},
        )
    return MealplanGenerateResponse(
        visible_candidates=visible,
        candidate_pool_size=candidate_pool_size,
    )
