# Personal RAG Notetaking Backend

This is the FastAPI backend for the Personal RAG Notetaking App. It provides document ingestion, retrieval augmented generation (RAG) query, and wiki-building APIs backed by SQLite and LanceDB. Offline-friendly embeddings and classification are available for local development and testing.

## Requirements

- Python 3.12+

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Configuration

The backend reads configuration from environment variables (see `.env.example`). Key settings include:

- `OPENAI_API_KEY`: Optional. When unset (or when `OFFLINE_MODE=true`), the app uses deterministic offline embeddings and keyword-based classification.
- `OFFLINE_MODE`: Set to `true` to force offline mode for embeddings, classification, and generation fallbacks.
- `DATA_DIR`, `FILE_STORAGE_DIR`, `LANCEDB_DIR`, `SQLITE_URL`: Storage locations for database files, parsed documents, and vector store.

## Running the Server

```bash
uvicorn app.main:app --reload
```

The app listens on `http://localhost:8000` by default.

### Available Endpoints

- `GET /health` – Health check.
- `POST /documents/upload` – Upload one or more files (multipart) and ingest them.
- `POST /documents` – Create or update a text note.
- `GET /documents` – List recent documents.
- `GET /documents/{id}` – Retrieve a specific document.
- `POST /query` – Perform a RAG query with optional label filters.
- `GET /wiki` – List available labels with wiki pages.
- `GET /wiki/{label}` – Fetch (and lazily build) a label wiki page.
- `POST /wiki/rebuild` – Rebuild wiki pages for all labels.

## Testing

```bash
pytest
```

Tests run in offline mode by default.

