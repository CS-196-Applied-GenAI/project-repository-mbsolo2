from __future__ import annotations

from pathlib import Path

import pytest


PROJECT_ROOT = Path(__file__).resolve().parents[1]

import sys

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.db.engine import get_engine
from app.db.models import init_db
from app.db.session import configure_session


@pytest.fixture(scope="function", autouse=True)
def _test_database(tmp_path_factory: pytest.TempPathFactory, monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Configure DATABASE_URL to point at a temporary SQLite file for the test session
    and ensure the SQLAlchemy engine/session are bound to it.
    """
    db_dir = tmp_path_factory.mktemp("db")
    db_path = db_dir / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")

    get_engine.cache_clear()
    configure_session()
    init_db()

