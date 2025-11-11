import io
import sys
from pathlib import Path

import pytest
from asgi_lifespan import LifespanManager
from httpx import ASGITransport, AsyncClient

# Ensure application package is discoverable when tests are run from repo root.
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.config import settings
from app.main import app


@pytest.mark.asyncio
async def test_upload_txt_and_md_files() -> None:
    transport = ASGITransport(app=app)

    text_file = ("notes.txt", io.BytesIO(b"Sample text content for ingestion."), "text/plain")
    md_content = "# Title\n\nSome markdown content with **bold** text."
    md_file = ("notes.md", io.BytesIO(md_content.encode("utf-8")), "text/markdown")

    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.post(
                "/api/v1/upload",
                data={"tags": "project, test"},
                files=[("files", text_file), ("files", md_file)],
            )

    assert response.status_code == 200

    payload = response.json()

    assert "doc_id" in payload and isinstance(payload["doc_id"], str)
    assert "files" in payload and isinstance(payload["files"], list)
    assert "total_chunks" in payload and isinstance(payload["total_chunks"], int)

    doc_id = payload["doc_id"]
    files_info = payload["files"]
    total_chunks = payload["total_chunks"]

    assert len(files_info) == 2
    assert all(file_info["chunks"] > 0 for file_info in files_info)
    assert total_chunks == sum(file_info["chunks"] for file_info in files_info)

    raw_dir = Path(settings.DATA_RAW_DIR) / doc_id
    assert raw_dir.exists() and raw_dir.is_dir()
    assert (raw_dir / "notes.txt").exists()
    assert (raw_dir / "notes.md").exists()

    chroma_dir = Path(settings.CHROMA_DIR)
    chroma_dir.mkdir(parents=True, exist_ok=True)
    chroma_content = list(chroma_dir.rglob("*"))
    assert any(path.is_file() for path in chroma_content), "Expected persisted files in Chroma directory"

    # Cleanup artifacts generated during test execution.
    for file_path in raw_dir.iterdir():
        file_path.unlink(missing_ok=True)
    raw_dir.rmdir()

    for path in sorted(chroma_content, key=lambda p: len(p.parts), reverse=True):
        if path.is_file():
            path.unlink()
        elif path.is_dir():
            try:
                path.rmdir()
            except OSError:
                pass

