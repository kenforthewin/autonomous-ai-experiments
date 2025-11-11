"""Upload API routes for document ingestion."""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.services.ingestion import IngestionService


router = APIRouter(prefix="/api/v1")


class IngestedFile(BaseModel):
    filename: str
    chunks: int


class UploadResponse(BaseModel):
    doc_id: str
    files: List[IngestedFile]
    total_chunks: int


def get_ingestion_service(settings: Settings = Depends(get_settings)) -> IngestionService:
    return IngestionService(settings=settings)


@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    files: List[UploadFile] = File(...),
    tags: Optional[str] = Form(None),
    service: IngestionService = Depends(get_ingestion_service),
) -> UploadResponse:
    parsed_tags: list[str] | None = None
    if tags is not None:
        parsed_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]

    result = await service.ingest_files(files=files, tags=parsed_tags)
    return UploadResponse(
        doc_id=result["doc_id"],
        files=[IngestedFile(**file_info) for file_info in result["files"]],
        total_chunks=result["total_chunks"],
    )

