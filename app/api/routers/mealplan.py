from __future__ import annotations

import logging

from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.mealplan import (
    MealplanGenerateRequest,
    MealplanGenerateResponse,
)
from app.services.mealplan_service import generate_mealplan
from app.services.recipe_provider import StubRecipeProvider

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/mealplan", tags=["mealplan"])


@router.post("/generate", response_model=MealplanGenerateResponse)
def post_generate_mealplan(
    payload: MealplanGenerateRequest | None = Body(None),
    db: Session = Depends(get_db),
) -> MealplanGenerateResponse | JSONResponse:
    provider = StubRecipeProvider()
    try:
        visible, candidate_pool_size = generate_mealplan(db, provider)
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
