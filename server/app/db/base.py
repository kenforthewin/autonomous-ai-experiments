from __future__ import annotations

import contextlib
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(settings.sqlite_url, echo=settings.debug_sql)
    return _engine


def init_db() -> None:
    engine = get_engine()
    SQLModel.metadata.create_all(engine)


@contextlib.contextmanager
def get_session() -> Iterator[Session]:
    engine = get_engine()
    with Session(engine) as session:
        yield session

