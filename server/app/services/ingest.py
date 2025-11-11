from __future__ import annotations

from typing import Sequence

from app.rag.chunking import chunk_text
from app.rag.embeddings import get_embeddings
from app.rag.store import upsert_chunks


def build_chunks_for_text(doc_id: str, text: str, labels: Sequence[str]) -> list[dict[str, object]]:
    chunks = chunk_text(text)
    if not chunks:
        return []

    vectors = get_embeddings(chunks)
    metadata = [{"index": idx, "length": len(chunk)} for idx, chunk in enumerate(chunks)]

    upsert_chunks(
        doc_id=doc_id,
        chunks=chunks,
        labels=list(labels),
        metadata_per_chunk=metadata,
        vectors=vectors,
    )

    return [
        {
            "doc_id": doc_id,
            "chunk_index": idx,
            "text": chunk,
            "labels": list(labels),
            "vector_dim": len(vector),
        }
        for idx, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]

