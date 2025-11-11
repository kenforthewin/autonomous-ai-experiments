from __future__ import annotations

import re
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.core.config import get_settings
from app.db.base import get_session
from app.db.models import Document
from app.rag.embeddings import get_embeddings
from app.rag.store import search

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    query: str
    labels: Optional[List[str]] = None
    k: int = Field(default=5, ge=1, le=20)


class Citation(BaseModel):
    doc_id: str
    title: str
    chunk_index: int


class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]


_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


def _split_sentences(text: str) -> List[str]:
    sentences = _SENTENCE_RE.split(text.strip())
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    if not sentences and text.strip():
        sentences = [text.strip()]
    return sentences


def _build_citations(records: List[dict], doc_titles: Dict[str, str]) -> List[Citation]:
    seen: set[tuple[str, int]] = set()
    citations: List[Citation] = []
    for record in records:
        doc_id = record.get("doc_id")
        metadata = record.get("metadata") or {}
        chunk_index = metadata.get("index")
        if chunk_index is None:
            try:
                chunk_index = int(str(record.get("id", "")).split(":")[-1])
            except ValueError:
                chunk_index = 0
        key = (doc_id, chunk_index)
        if doc_id and key not in seen:
            seen.add(key)
            citations.append(
                Citation(
                    doc_id=str(doc_id),
                    title=doc_titles.get(str(doc_id), str(doc_id)),
                    chunk_index=int(chunk_index),
                )
            )
    return citations


def _offline_answer(records: List[dict], doc_titles: Dict[str, str]) -> QueryResponse:
    sentences: List[str] = []
    for record in records:
        text = record.get("text", "")
        for sentence in _split_sentences(text):
            sentences.append(sentence)
            if len(" ".join(sentences)) > 800:
                break
        if len(sentences) >= 6:
            break
    answer = " ".join(sentences) if sentences else "No relevant information found."
    citations = _build_citations(records, doc_titles)
    return QueryResponse(answer=answer, citations=citations)


def _online_answer(
    query: str,
    records: List[dict],
    doc_titles: Dict[str, str],
) -> QueryResponse:
    settings = get_settings()
    try:
        from openai import OpenAI
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("OpenAI SDK not available") from exc

    client = OpenAI(api_key=settings.openai_api_key)

    context_sections: List[str] = []
    total_chars = 0
    for idx, record in enumerate(records):
        doc_id = str(record.get("doc_id"))
        chunk_index = record.get("metadata", {}).get("index")
        if chunk_index is None:
            try:
                chunk_index = int(str(record.get("id", "")).split(":")[-1])
            except ValueError:
                chunk_index = idx
        title = doc_titles.get(doc_id, doc_id)
        section_text = record.get("text", "")
        section = (
            f"Source {idx + 1}: {title} (ID: {doc_id}, Chunk {chunk_index})\n"
            f"{section_text.strip()}"
        )
        context_sections.append(section)
        total_chars += len(section_text)
        if total_chars > 12000:
            break

    if not context_sections:
        return QueryResponse(answer="No relevant information found.", citations=[])

    prompt = (
        "You are a helpful assistant generating answers using only the provided context. "
        "Include supporting details when available. After the answer, provide a section titled "
        "'Citations' containing a bulleted list where each item references the document title and "
        "chunk index in the format '- Title (Chunk X)'."
    )
    user_content = (
        f"Question: {query}\n\nContext:\n" + "\n\n".join(context_sections) + "\n\nRespond concisely."
    )

    response = client.chat.completions.create(
        model=settings.rag_gen_model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.2,
        max_tokens=512,
    )

    message = response.choices[0].message.content or "No relevant information found."
    citations = _build_citations(records, doc_titles)
    return QueryResponse(answer=message.strip(), citations=citations)


@router.post("", response_model=QueryResponse)
async def run_query(
    payload: QueryRequest,
    session: Session = Depends(get_session),
) -> QueryResponse:
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty")

    embeddings = get_embeddings([query])
    if not embeddings:
        return QueryResponse(answer="No relevant information found.", citations=[])

    results = search(embeddings[0], k=payload.k, filter_labels=payload.labels)

    doc_ids = {str(record.get("doc_id")) for record in results if record.get("doc_id")}
    doc_titles: Dict[str, str] = {}
    if doc_ids:
        uuid_ids = []
        for doc_id in doc_ids:
            try:
                uuid_ids.append(UUID(doc_id))
            except ValueError:
                continue
        if uuid_ids:
            statement = select(Document).where(Document.id.in_(uuid_ids))
            documents = session.exec(statement).all()
            for document in documents:
                doc_titles[str(document.id)] = document.title

    settings = get_settings()
    use_offline = settings.offline_mode or not settings.openai_api_key

    if use_offline:
        return _offline_answer(results, doc_titles)

    try:
        return _online_answer(payload.query, results, doc_titles)
    except Exception:
        return _offline_answer(results, doc_titles)

