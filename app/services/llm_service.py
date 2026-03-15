"""
LLM service for structured recipe generation.
Uses OpenAI when configured; returns None on missing config or errors.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from app.config import (
    get_mealplan_llm_model,
    get_openai_api_key,
    is_llm_recipe_provider_available,
)
from app.schemas.recipe import Ingredient, RecipeCandidate

logger = logging.getLogger(__name__)

RECIPES_JSON_SCHEMA = """
Return a JSON object with a single key "recipes" whose value is an array of recipe objects.
Each recipe must have:
- "recipe_id": string, unique id (e.g. "llm-1", "llm-2")
- "title": string, recipe name
- "servings": integer, number of servings (1-8)
- "ingredients": array of { "name": string, "amount": number, "unit": string }
- "instructions": array of strings, step-by-step

Use common units (cup, g, oz, tbsp, etc.). Amounts can be decimals.
"""


def _build_system_prompt() -> str:
    return (
        "You are a helpful recipe assistant. Generate simple, realistic recipes. "
        + RECIPES_JSON_SCHEMA
    )


def _build_user_prompt(context: str | None, limit: int) -> str:
    if context:
        return (
            f"Given the following kitchen context, suggest {limit} recipes the user can make. "
            f"Prefer recipes that use these ingredients when possible.\n\nContext:\n{context}\n\n"
            "Respond with valid JSON only, no markdown or extra text."
        )
    return (
        f"Suggest {limit} varied, simple recipes (different cuisines or styles). "
        "Respond with valid JSON only, no markdown or extra text."
    )


def _parse_recipes(raw: str, limit: int) -> list[RecipeCandidate] | None:
    """Parse LLM response into list of RecipeCandidate. Returns None on invalid data."""
    try:
        # Strip markdown code fence if present
        text = raw.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines)
        data: Any = json.loads(text)
        if not isinstance(data, dict) or "recipes" not in data:
            return None
        recipes_data = data["recipes"]
        if not isinstance(recipes_data, list):
            return None
        result: list[RecipeCandidate] = []
        for i, r in enumerate(recipes_data[:limit]):
            if not isinstance(r, dict):
                continue
            try:
                rid = r.get("recipe_id") or f"llm-{i + 1}"
                title = r.get("title") or "Generated Recipe"
                if not isinstance(title, str) or not title.strip():
                    continue
                servings = r.get("servings", 2)
                if isinstance(servings, (int, float)):
                    servings = max(1, min(8, int(servings)))
                else:
                    servings = 2
                ing_list = r.get("ingredients") or []
                if not isinstance(ing_list, list):
                    ing_list = []
                ingredients: list[Ingredient] = []
                for ing in ing_list:
                    if not isinstance(ing, dict):
                        continue
                    name = ing.get("name")
                    if not name or not str(name).strip():
                        continue
                    amount = ing.get("amount", 1)
                    if isinstance(amount, (int, float)):
                        amount = float(amount) if amount != int(amount) else int(amount)
                    else:
                        amount = 1
                    unit = ing.get("unit") or "unit"
                    if not isinstance(unit, str):
                        unit = "unit"
                    ingredients.append(
                        Ingredient(name=str(name).strip(), amount=amount, unit=unit.strip())
                    )
                instr_list = r.get("instructions") or []
                if not isinstance(instr_list, list):
                    instr_list = []
                instructions = [str(s).strip() for s in instr_list if s]
                if not instructions:
                    instructions = ["Combine ingredients and cook as desired."]
                result.append(
                    RecipeCandidate(
                        recipe_id=str(rid),
                        title=title.strip(),
                        servings=servings,
                        ingredients=ingredients,
                        instructions=instructions,
                    )
                )
            except Exception:
                continue
        return result if result else None
    except json.JSONDecodeError:
        return None
    except Exception:
        return None


def generate_recipes(
    context: str | None = None,
    limit: int = 15,
) -> list[RecipeCandidate] | None:
    """
    Generate recipe candidates using the configured LLM.
    Returns None if LLM is not configured, API key is missing, or any error occurs.
    """
    if not is_llm_recipe_provider_available():
        return None
    api_key = get_openai_api_key()
    if not api_key:
        return None
    model = get_mealplan_llm_model()
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": _build_system_prompt()},
                {"role": "user", "content": _build_user_prompt(context, limit)},
            ],
            temperature=0.7,
            max_tokens=4096,
        )
        content = response.choices[0].message.content if response.choices else None
        if not content:
            return None
        recipes = _parse_recipes(content, limit)
        if recipes:
            logger.info("LLM generated %d recipe(s) for mealplan", len(recipes))
        return recipes
    except ImportError:
        logger.warning("openai package not installed; LLM recipe generation unavailable")
        return None
    except Exception as e:
        logger.warning("LLM recipe generation failed: %s", e, exc_info=True)
        return None
