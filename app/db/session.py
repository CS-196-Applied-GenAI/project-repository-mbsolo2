from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from .engine import get_engine


SessionLocal = sessionmaker(autoflush=False, autocommit=False)


def configure_session() -> None:
    SessionLocal.configure(bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    configure_session()
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

