from datetime import date, datetime

from app.services.expiration_service import (
    effective_expiration,
    estimate_expiration,
    is_expired,
)


def test_effective_expiration_prefers_override() -> None:
    estimated = date(2024, 1, 20)
    override = date(2024, 1, 25)

    assert effective_expiration(estimated, override) == override
    assert effective_expiration(estimated, None) == estimated
    assert effective_expiration(None, None) is None


def test_is_expired_compares_to_today() -> None:
    now = datetime(2024, 1, 10, 12, 0, 0)

    past = date(2024, 1, 9)
    today = date(2024, 1, 10)
    future = date(2024, 1, 11)

    assert is_expired(past, now) is True
    assert is_expired(today, now) is False
    assert is_expired(future, now) is False
    assert is_expired(None, now) is False


def test_estimate_expiration_depends_on_category_and_opened() -> None:
    created_at = datetime(2024, 1, 1, 8, 0, 0)

    # Dairy (unopened vs opened)
    dairy_unopened = estimate_expiration(created_at, "dairy", opened=False)
    dairy_opened = estimate_expiration(created_at, "dairy", opened=True)
    assert dairy_unopened == date(2024, 1, 8)  # 7 days after creation
    assert dairy_opened == date(2024, 1, 4)  # 3 days after creation

    # Pantry grain (much longer shelf-life)
    grain_unopened = estimate_expiration(created_at, "grain", opened=False)
    grain_opened = estimate_expiration(created_at, "grain", opened=True)
    assert grain_unopened == date(2024, 12, 31)  # 365 days after 2024-01-01 (leap year)
    assert grain_opened == date(2024, 6, 29)  # 180 days

    # Unknown category gets a reasonable default
    unknown_unopened = estimate_expiration(created_at, "mystery", opened=False)
    unknown_opened = estimate_expiration(created_at, "mystery", opened=True)
    assert unknown_unopened == date(2024, 1, 31)  # 30 days
    assert unknown_opened == date(2024, 1, 15)  # 14 days

