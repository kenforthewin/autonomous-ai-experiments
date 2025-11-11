from __future__ import annotations

from typing import Iterator

from fastapi import Depends
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.db.base import get_engine


def get_session(settings: Settings = Depends(get_settings)) -> Iterator[Session]:
    engine = get_engine()
    with Session(engine) as session:
        yield session

