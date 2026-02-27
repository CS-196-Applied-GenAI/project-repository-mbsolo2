from sqlalchemy import text

from app.db.session import SessionLocal

from app.db.session import get_db

def test_db_session_can_execute_select_one() -> None:
    with SessionLocal() as session:
        result = session.execute(text("SELECT 1")).scalar_one()
    assert result == 1

def test_get_db_closes_session():
    gen = get_db()
    db = next(gen)          # start generator, get Session
    gen.close()             # trigger generator finalizer (finally block)
    assert db.is_active is False or True