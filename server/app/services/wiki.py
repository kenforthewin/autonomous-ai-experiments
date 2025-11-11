from __future__ import annotations

from datetime import datetime
from typing import Dict, List
from uuid import UUID

from sqlmodel import Session, select

from app.core.config import get_settings
from app.db.models import Document, WikiPage
from app.rag.embeddings import get_embeddings
from app.rag.store import search


def _collect_label_chunks(label: str, k: int = 50) -> List[dict]:
    embeddings = get_embeddings([label])
    if not embeddings:
        return []
    return search(embeddings[0], k=k, filter_labels=[label])


def _build_wiki_offline(label: str, records: List[dict], doc_map: Dict[str, Document]) -> str:
    lines = [f"# {label.title()}", ""]
    if not records:
        lines.append("No content available yet.")
    else:
        for record in records[:20]:
            text = record.get("text", "").strip()
            if text:
                lines.append(f"- {text[:300]}")
    lines.append("")
    lines.append("## References")
    for idx, record in enumerate(records):
        doc_id = str(record.get("doc_id"))
        doc = doc_map.get(doc_id)
        title = doc.title if doc else doc_id
        chunk_index = record.get("metadata", {}).get("index", idx)
        lines.append(f"[{idx + 1}] {title} ({doc_id}:{chunk_index})")
    return "\n".join(lines)


def _build_wiki_online(label: str, records: List[dict], doc_map: Dict[str, Document]) -> str:
    from openai import OpenAI

    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)

    context = []
    for idx, record in enumerate(records):
        doc_id = str(record.get("doc_id"))
        chunk_index = record.get("metadata", {}).get("index", idx)
        doc = doc_map.get(doc_id)
        title = doc.title if doc else doc_id
        text = record.get("text", "")
        context.append(
            f"Source {idx + 1}: {title} ({doc_id}:{chunk_index})\n{text.strip()}"
        )

    if not context:
        return f"# {label.title()}\n\nNo content available yet."

    prompt = (
        "You are generating a markdown wiki page for a personal knowledge base using only the provided sources. "
        "Create 3-4 sections with concise summaries referencing the sources. End with a '## References' section "
        "listing items in the format '[#] Title (doc_id:chunk_index)'."
    )

    response = client.chat.completions.create(
        model=settings.rag_gen_model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "\n\n".join(context)},
        ],
        temperature=0.2,
        max_tokens=800,
    )

    return response.choices[0].message.content or f"# {label.title()}\n\nNo content available yet."


def build_label_wiki(label: str, session: Session) -> str:
    settings = get_settings()
    records = _collect_label_chunks(label)

    doc_map: Dict[str, Document] = {}
    if records:
        doc_ids = {str(record.get("doc_id")) for record in records if record.get("doc_id")}
        uuid_ids: List[UUID] = []
        for doc_id in doc_ids:
            try:
                uuid_ids.append(UUID(doc_id))
            except ValueError:
                continue
        if uuid_ids:
            docs = session.exec(select(Document).where(Document.id.in_(uuid_ids))).all()
            for doc in docs:
                doc_map[str(doc.id)] = doc

    if settings.offline_mode or not settings.openai_api_key:
        return _build_wiki_offline(label, records, doc_map)

    try:
        return _build_wiki_online(label, records, doc_map)
    except Exception:
        return _build_wiki_offline(label, records, doc_map)


def update_wiki_page(label: str, session: Session) -> WikiPage:
    content = build_label_wiki(label, session)
    page = session.get(WikiPage, label)
    if page:
        page.content_md = content
        page.last_built_at = datetime.utcnow()
    else:
        page = WikiPage(label=label, content_md=content)
        session.add(page)
    session.add(page)
    session.commit()
    session.refresh(page)
    return page

