from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Optional


def estimate_expiration(created_at: datetime, category: str, opened: bool) -> date:
    """
    Return a conservative estimated expiration date based on category and opened flag.
    The mapping is simple but deterministic so tests can lock behavior.
    """
    category_key = category.lower()

    if category_key in {"dairy", "dairy_alt"}:
        days = 7 if not opened else 3
    elif category_key in {"protein"}:
        days = 5 if not opened else 2
    elif category_key in {"grain"}:
        days = 365 if not opened else 180
    elif category_key in {"condiment"}:
        days = 365 if not opened else 120
    elif category_key in {"produce"}:
        days = 7 if not opened else 3
    elif category_key in {"frozen"}:
        days = 365
    else:
        days = 30 if not opened else 14

    return created_at.date() + timedelta(days=days)


def effective_expiration(
    estimated: Optional[date], override: Optional[date]
) -> Optional[date]:
    if override is not None:
        return override
    return estimated


def is_expired(effective_expiration_date: Optional[date], now: datetime) -> bool:
    if effective_expiration_date is None:
        return False
    return effective_expiration_date < now.date()

