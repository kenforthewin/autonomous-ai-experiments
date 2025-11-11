from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.upload import router as upload_router

PUBLIC_DIR = Path("public")
INDEX_FILE = PUBLIC_DIR / "index.html"

PLACEHOLDER_HTML = """\
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>Personal RAG Backend</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        a { color: #1f6feb; }
    </style>
</head>
<body>
    <h1>Personal RAG Backend</h1>
    <p>Static index.html not found. Replace this placeholder with your UI.</p>
    <p><a href=\"/api/v1/health\">Health Check</a></p>
</body>
</html>
"""


class SPAStaticFiles(StaticFiles):
    """Static files handler that falls back to index.html or placeholder."""

    def __init__(self, directory: Path, index_file: Path) -> None:
        super().__init__(directory=str(directory), html=True)
        self._index_file = index_file

    async def get_response(self, path: str, scope):  # type: ignore[override]
        normalized_path = path.lstrip("/")

        if not normalized_path or normalized_path == "index.html":
            if self._index_file.exists():
                return FileResponse(self._index_file)
            return HTMLResponse(content=PLACEHOLDER_HTML, status_code=200)

        response = await super().get_response(path, scope)

        if response.status_code == 404 and self._index_file.exists():
            return FileResponse(self._index_file)

        if response.status_code == 404:
            return HTMLResponse(content=PLACEHOLDER_HTML, status_code=200)

        return response


app = FastAPI(title="Personal RAG Backend", version="0.1.0")
app.include_router(upload_router)
allowed_origins = ["http://localhost:3000", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    """Return simple health status."""

    return {"status": "ok"}

app.mount("/", SPAStaticFiles(directory=PUBLIC_DIR, index_file=INDEX_FILE), name="public")

