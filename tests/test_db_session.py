from sqlalchemy import text

from app.db.session import SessionLocal


def test_db_session_can_execute_select_one() -> None:
    with SessionLocal() as session:
        result = session.execute(text("SELECT 1")).scalar_one()
    assert result == 1

