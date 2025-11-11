from __future__ import annotations

from pathlib import Path
from typing import Iterator

import pytest
from fastapi.testclient import TestClient

from app.core.config import set_settings
from app.main import create_app


@pytest.fixture(autouse=True)
def reset_settings() -> None:
    set_settings(None)


@pytest.fixture()
def test_client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    data_dir = tmp_path / "data"
    files_dir = data_dir / "files"
    lancedb_dir = data_dir / "lancedb"

    monkeypatch.setenv("OFFLINE_MODE", "true")
    monkeypatch.setenv("DATA_DIR", str(data_dir))
    monkeypatch.setenv("FILE_STORAGE_DIR", str(files_dir))
    monkeypatch.setenv("LANCEDB_DIR", str(lancedb_dir))
    monkeypatch.setenv("SQLITE_URL", f"sqlite:///{data_dir / 'app.db'}")

    set_settings(None)

    app = create_app()

    with TestClient(app) as client:
        yield client

    set_settings(None)

