"""Document ingestion services for the application."""

from __future__ import annotations

import hashlib
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence

import numpy as np
from fastapi import UploadFile
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from pypdf import PdfReader

try:  # Prefer new module path in 2025 langchain releases
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:  # pragma: no cover - fallback for older versions
    from langchain.text_splitter import RecursiveCharacterTextSplitter  # type: ignore

from app.config import Settings


class FakeDeterministicEmbeddings:
    """Deterministic embedding generator for local tests without OpenAI access."""

    def __init__(self, dim: int = 1536) -> None:
        self.dim = dim

    def _vector_from_text(self, text: str) -> list[float]:
        seed_bytes = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(seed_bytes[:8], "big", signed=False)
        rng = np.random.default_rng(seed)
        return rng.standard_normal(self.dim, dtype=np.float32).tolist()

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        return [self._vector_from_text(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._vector_from_text(text)


class EmbeddingProvider:
    """Factory for embedding functions used by the vector store."""

    @staticmethod
    def get_embedding_function(settings: Settings):
        """Return an embeddings implementation based on runtime settings."""

        if settings.OPENAI_API_KEY and settings.USE_OPENAI_FOR_TESTS:
            return OpenAIEmbeddings(model=settings.EMBEDDING_MODEL, api_key=settings.OPENAI_API_KEY)
        return FakeDeterministicEmbeddings(dim=1536)


def build_text_splitter() -> RecursiveCharacterTextSplitter:
    """Return configured text splitter for chunking documents."""

    return RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)


def read_file_to_text(path: Path) -> list[tuple[str, dict[str, int | None]]]:
    """Extract text segments from a supported document path."""

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    ext = path.suffix.lower()
    segments: list[tuple[str, dict[str, int | None]]] = []

    if ext in {".txt", ".md"}:
        text = path.read_text(encoding="utf-8", errors="ignore")
        segments.append((text, {"page": None}))
        return segments

    if ext == ".pdf":
        reader = PdfReader(str(path))
        for index, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text() or ""
            segments.append((page_text, {"page": index}))
        return segments

    raise ValueError(f"Unsupported file type: {ext}")


@dataclass
class IngestedFileSummary:
    filename: str
    chunks: int


class IngestionService:
    """Service responsible for ingesting and persisting uploaded documents."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.embedding_provider = EmbeddingProvider()

    async def ingest_files(self, files: Sequence[UploadFile], tags: Sequence[str] | None = None) -> dict[str, object]:
        if not files:
            raise ValueError("No files provided for ingestion.")

        normalized_tags = [tag.strip() for tag in (tags or []) if tag and tag.strip()]

        doc_id = uuid.uuid4().hex
        raw_dir = Path(self.settings.DATA_RAW_DIR) / doc_id
        raw_dir.mkdir(parents=True, exist_ok=True)

        created_at = datetime.now(timezone.utc).isoformat()
        splitter = build_text_splitter()

        def _sanitize_metadata(value: Any) -> Any:
            if isinstance(value, (list, tuple, set)):
                return ", ".join(str(item) for item in value)
            if isinstance(value, dict):
                return {str(key): _sanitize_metadata(val) for key, val in value.items()}
            return value

        documents: list[Document] = []
        file_summaries: list[IngestedFileSummary] = []

        for upload in files:
            filename = Path(upload.filename or "untitled").name
            destination = raw_dir / filename

            file_bytes = await upload.read()
            destination.write_bytes(file_bytes)
            await upload.close()

            segments = read_file_to_text(destination)
            raw_docs: list[Document] = []
            for text, meta in segments:
                if not text.strip():
                    continue
                metadata = {
                    "doc_id": doc_id,
                    "title": filename,
                    "path": str(Path(self.settings.DATA_RAW_DIR) / doc_id / filename),
                    "page": meta.get("page"),
                    "tags": ", ".join(normalized_tags) if normalized_tags else None,
                    "created_at": created_at,
                }
                metadata = {key: _sanitize_metadata(value) for key, value in metadata.items() if value is not None}
                raw_docs.append(Document(page_content=text, metadata=metadata))

            chunked_docs = splitter.split_documents(raw_docs)
            for chunk_doc in chunked_docs:
                chunk_doc.metadata = {**chunk_doc.metadata, "chunk_id": uuid.uuid4().hex}
            documents.extend(chunked_docs)
            file_summaries.append(IngestedFileSummary(filename=filename, chunks=len(chunked_docs)))

        if not documents:
            raise ValueError("No textual content extracted from provided files.")

        persist_dir = Path(self.settings.CHROMA_DIR)
        persist_dir.mkdir(parents=True, exist_ok=True)

        embeddings = self.embedding_provider.get_embedding_function(self.settings)
        vector_store = Chroma(
            collection_name="notes",
            embedding_function=embeddings,
            persist_directory=str(persist_dir),
        )
        vector_store.add_documents(documents)

        client = getattr(vector_store, "_client", None)
        if client is not None and hasattr(client, "persist"):
            client.persist()

        total_chunks = sum(summary.chunks for summary in file_summaries)

        return {
            "doc_id": doc_id,
            "files": [summary.__dict__ for summary in file_summaries],
            "total_chunks": total_chunks,
        }

