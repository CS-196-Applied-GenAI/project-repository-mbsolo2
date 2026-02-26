from __future__ import annotations

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.mealplan import (
    MealplanGenerateRequest,
    MealplanGenerateResponse,
)
from app.services.mealplan_service import generate_mealplan
from app.services.recipe_provider import StubRecipeProvider

router = APIRouter(prefix="/api/v1/mealplan", tags=["mealplan"])


@router.post("/generate", response_model=MealplanGenerateResponse)
def post_generate_mealplan(
    payload: MealplanGenerateRequest | None = Body(None),
    db: Session = Depends(get_db),
) -> MealplanGenerateResponse:
    provider = StubRecipeProvider()
    visible, candidate_pool_size = generate_mealplan(db, provider)
    return MealplanGenerateResponse(
        visible_candidates=visible,
        candidate_pool_size=candidate_pool_size,
    )
