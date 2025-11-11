from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, JSON, SQLModel


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True, index=True)
    title: str = Field(nullable=False)
    source_filename: Optional[str] = Field(default=None, nullable=True)
    text_path: str = Field(nullable=False)
    text_sha256: str = Field(nullable=False)
    labels: list[str] = Field(default_factory=list, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class WikiPage(SQLModel, table=True):
    __tablename__ = "wiki_pages"

    label: str = Field(primary_key=True)
    content_md: str = Field(nullable=False)
    last_built_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

