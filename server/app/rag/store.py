from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import lancedb
from lancedb import DBConnection

from app.core.config import get_settings

_TABLE_NAME = "chunks"


@dataclass(slots=True)
class LanceDBRecord:
    id: str
    doc_id: str
    text: str
    labels: list[str]
    metadata: dict[str, Any]
    vector: list[float]


def _get_db() -> DBConnection:
    settings = get_settings()
    return lancedb.connect(str(settings.lancedb_path))


def _table_exists(db: DBConnection) -> bool:
    return _TABLE_NAME in db.table_names()


def upsert_chunks(
    doc_id: str,
    chunks: list[str],
    labels: list[str],
    metadata_per_chunk: list[dict[str, Any]],
    vectors: list[list[float]],
) -> None:
    if not chunks:
        return

    if not (len(chunks) == len(metadata_per_chunk) == len(vectors)):
        raise ValueError("chunks, metadata, and vectors must have the same length")

    records = [
        {
            "id": f"{doc_id}:{idx}",
            "doc_id": doc_id,
            "text": chunk_text,
            "labels": labels,
            "metadata": metadata,
            "vector": vector,
        }
        for idx, (chunk_text, metadata, vector) in enumerate(
            zip(chunks, metadata_per_chunk, vectors)
        )
    ]

    db = _get_db()
    if not _table_exists(db):
        db.create_table(_TABLE_NAME, data=records, primary_key="id")
        return

    table = db.open_table(_TABLE_NAME)
    delete_by_doc(doc_id)
    table.add(records)


def delete_by_doc(doc_id: str) -> None:
    db = _get_db()
    if not _table_exists(db):
        return

    table = db.open_table(_TABLE_NAME)
    where_clause = f"doc_id = '{doc_id}'"
    table.delete(where_clause)


def search(
    query_vector: list[float],
    k: int = 8,
    filter_labels: list[str] | None = None,
) -> list[dict[str, Any]]:
    db = _get_db()
    if not _table_exists(db):
        return []

    table = db.open_table(_TABLE_NAME)

    query = table.search(query_vector).limit(k)
    if filter_labels:
        query = query.where(lambda record: any(label in record["labels"] for label in filter_labels))

    results = query.to_list()
    return results

