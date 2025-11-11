from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Personal RAG Notetaking App Backend"
    environment: Literal["local", "test", "production"] = Field(default="local")
    debug: bool = False
    debug_sql: bool = False

    openai_api_key: str | None = Field(default=None, validation_alias="OPENAI_API_KEY")
    rag_embed_model: str = Field(default="text-embedding-3-small", validation_alias="RAG_EMBED_MODEL")
    rag_gen_model: str = Field(default="gpt-4o-mini", validation_alias="RAG_GEN_MODEL")

    data_dir: str = Field(default="./data", validation_alias="DATA_DIR")
    lancedb_dir: str = Field(default="./data/lancedb", validation_alias="LANCEDB_DIR")
    file_storage_dir: str = Field(default="./data/files", validation_alias="FILE_STORAGE_DIR")
    sqlite_url: str = Field(default="sqlite:///./data/app.db", validation_alias="SQLITE_URL")
    server_port: int = Field(default=8000, validation_alias="SERVER_PORT")

    @computed_field(return_type=Path)
    def data_dir_path(self) -> Path:
        return Path(self.data_dir).resolve()

    @computed_field(return_type=Path)
    def lancedb_path(self) -> Path:
        return Path(self.lancedb_dir).resolve()

    @computed_field(return_type=Path)
    def file_storage_path(self) -> Path:
        return Path(self.file_storage_dir).resolve()


_cached_settings: Settings | None = None


def get_settings() -> Settings:
    global _cached_settings
    if _cached_settings is None:
        _cached_settings = Settings()  # type: ignore[arg-type]
        for directory in (
            _cached_settings.data_dir_path,
            _cached_settings.lancedb_path,
            _cached_settings.file_storage_path,
        ):
            directory.mkdir(parents=True, exist_ok=True)
    return _cached_settings

