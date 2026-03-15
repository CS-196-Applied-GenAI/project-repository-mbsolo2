import os
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


DEFAULT_DB_URL = "sqlite:///./dev.db"


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", DEFAULT_DB_URL)


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    url = get_database_url()
    connect_args: dict | None = None
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(url, connect_args=connect_args or {})

