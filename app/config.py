"""
Application configuration from environment.
LLM-related settings support optional mealplan recipe generation.
"""
from __future__ import annotations

import os


def _bool_env(name: str, default: bool = False) -> bool:
    raw = os.getenv(name, "").strip().lower()
    if not raw:
        return default
    return raw in ("1", "true", "yes", "on")


def get_mealplan_llm_enabled() -> bool:
    """True if LLM-backed recipe generation is enabled (and config is present)."""
    return _bool_env("MEALPLAN_LLM_ENABLED", default=False)


def get_openai_api_key() -> str | None:
    """OpenAI API key; None if not set. Do not log or expose."""
    key = os.getenv("OPENAI_API_KEY", "").strip()
    return key if key else None


def get_mealplan_llm_model() -> str:
    """Model name for mealplan recipe generation. Ignored if LLM is disabled."""
    return os.getenv("MEALPLAN_LLM_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"


def is_llm_recipe_provider_available() -> bool:
    """True if LLM recipe generation is enabled and API key is set."""
    return get_mealplan_llm_enabled() and get_openai_api_key() is not None
