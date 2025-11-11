from __future__ import annotations

from typing import Dict, List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db.base import get_session
from app.db.models import Document
from app.services.wiki import update_wiki_page

router = APIRouter(prefix="/wiki", tags=["wiki"])


@router.get("")
async def list_labels(session: Session = Depends(get_session)) -> Dict[str, List[str]]:
    statement = select(Document.labels)
    all_labels = session.exec(statement).all()
    label_set = {label for labels in all_labels for label in labels}
    return {"labels": sorted(label_set)}


@router.get("/{label}")
async def get_label_wiki(label: str, session: Session = Depends(get_session)) -> Dict[str, str]:
    page = update_wiki_page(label, session)
    return {"label": label, "content": page.content_md}


@router.post("/rebuild")
async def rebuild_wiki(session: Session = Depends(get_session)) -> Dict[str, int]:
    statement = select(Document.labels)
    all_labels = session.exec(statement).all()
    labels = sorted({label for labels in all_labels for label in labels})
    count = 0
    for label in labels:
        update_wiki_page(label, session)
        count += 1
    return {"rebuilt": count}

