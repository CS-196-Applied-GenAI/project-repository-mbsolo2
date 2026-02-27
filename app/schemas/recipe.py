from __future__ import annotations

from typing import Union

from pydantic import BaseModel


class Ingredient(BaseModel):
    name: str
    amount: Union[float, int]
    unit: str


class RecipeCandidate(BaseModel):
    recipe_id: str
    title: str
    servings: int
    ingredients: list[Ingredient]
    instructions: list[str]

