from __future__ import annotations

from hashlib import sha256
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.config import get_settings
from app.db.base import get_session
from app.db.models import Document
from app.services.classify import classify_labels
from app.services.ingest import build_chunks_for_text
from app.services.parsing import parse_file
from app.services.utils import normalize_text

router = APIRouter(prefix="/documents", tags=["documents"])


def _save_text_file(base_dir: Path, filename: str, content: str) -> Path:
    base_dir.mkdir(parents=True, exist_ok=True)
    path = base_dir / filename
    path.write_text(content, encoding="utf-8")
    return path


def _compute_sha256(text: str) -> str:
    return sha256(text.encode("utf-8")).hexdigest()


@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    labels: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> dict:
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files uploaded")

    settings = get_settings()
    base_dir = settings.file_storage_path
    base_dir.mkdir(parents=True, exist_ok=True)

    label_list = []
    if labels:
        label_list = [label.strip() for label in labels.split(",") if label.strip()]

    created_docs = []
    for upload in files:
        filename = Path(upload.filename or "uploaded_file").name
        target_path = base_dir / filename
        target_path.write_bytes(await upload.read())

        try:
            text = parse_file(target_path)
        except Exception as exc:  # pragma: no cover - to guard against parsing issues
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

        sha256 = _compute_sha256(text)
        document = Document(
            title=filename,
            source_filename=filename,
            text_path=str(target_path),
            text_sha256=sha256,
            labels=label_list.copy(),
        )
        session.add(document)
        session.commit()
        session.refresh(document)

        auto_labels = classify_labels(text)
        merged_labels = sorted({*document.labels, *auto_labels})
        document.labels = merged_labels
        document.updated_at = datetime.utcnow()
        session.add(document)
        session.commit()
        session.refresh(document)

        build_chunks_for_text(str(document.id), text, document.labels)

        created_docs.append(
            {
                "id": str(document.id),
                "title": document.title,
                "labels": document.labels,
            }
        )

    return {"documents": created_docs}


class NotePayload(BaseModel):
    id: Optional[UUID] = None
    title: str
    content: str
    labels: Optional[List[str]] = None


@router.post("")
async def create_or_update_note(
    payload: NotePayload,
    session: Session = Depends(get_session),
) -> dict:
    text = normalize_text(payload.content)
    sha256 = _compute_sha256(text)

    settings = get_settings()
    base_dir = settings.file_storage_path
    base_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{payload.title.replace(' ', '_')}.md"
    text_path = _save_text_file(base_dir, filename, text)

    if payload.id:
        document = session.get(Document, payload.id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        document.title = payload.title
        document.text_path = str(text_path)
        document.text_sha256 = sha256
        document.labels = payload.labels or document.labels
        document.updated_at = datetime.utcnow()
        session.add(document)
        session.commit()
        session.refresh(document)
    else:
        labels = payload.labels or []
        document = Document(
            title=payload.title,
            source_filename=None,
            text_path=str(text_path),
            text_sha256=sha256,
            labels=labels,
        )
        session.add(document)
        session.commit()
        session.refresh(document)

    auto_labels = classify_labels(text)
    merged_labels = sorted({*document.labels, *auto_labels})
    document.labels = merged_labels
    document.updated_at = datetime.utcnow()
    session.add(document)
    session.commit()

    build_chunks_for_text(str(document.id), text, document.labels)

    return {
        "id": str(document.id),
        "title": document.title,
        "labels": document.labels,
        "text_sha256": document.text_sha256,
    }


@router.get("")
async def list_documents(session: Session = Depends(get_session)) -> dict:
    statement = select(Document).order_by(Document.updated_at.desc()).limit(50)
    results = session.exec(statement).all()
    return {
        "documents": [
            {
                "id": str(doc.id),
                "title": doc.title,
                "labels": doc.labels,
                "updated_at": doc.updated_at.isoformat(),
            }
            for doc in results
        ]
    }


@router.get("/{document_id}")
async def get_document(document_id: UUID, session: Session = Depends(get_session)) -> dict:
    document = session.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    content: Optional[str] = None
    text_path = Path(document.text_path)
    if text_path.exists():
        try:
            if text_path.suffix.lower() in {".md", ".txt"}:
                content = text_path.read_text(encoding="utf-8")
            else:
                content = parse_file(text_path)
        except Exception:
            content = None
    return {
        "id": str(document.id),
        "title": document.title,
        "labels": document.labels,
        "text_path": document.text_path,
        "text_sha256": document.text_sha256,
        "updated_at": document.updated_at.isoformat(),
        "content": content,
    }

