from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.core.config import Settings, get_settings
from app.db.base import init_db


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    app = FastAPI(title=settings.app_name)

    _configure_cors(app)
    _include_routes(app)

    @app.on_event("startup")
    def on_startup() -> None:
        for directory in (
            settings.data_dir_path,
            settings.lancedb_path,
            settings.file_storage_path,
        ):
            directory.mkdir(parents=True, exist_ok=True)
        init_db()

    return app


def _configure_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def _include_routes(app: FastAPI) -> None:
    app.include_router(health.router)


app = create_app()

