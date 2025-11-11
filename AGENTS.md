# AGENTS

Project: Personal RAG Note-taking Web App

Purpose
- Let a user upload, create, and edit personal notes and documents.
- Parse and index content into a RAG pipeline for question answering.
- Auto-generate and maintain high-level, Wikipedia-style “category” pages compiled only from the user’s source materials.

High-level Architecture
- Backend API: FastAPI (Python) with SQLite for metadata and LanceDB for vector search. OpenAI for embeddings and generation.
- Frontend Web: Next.js (React) with Tailwind CSS for a modern UI.
- Data flow:
  1) Upload or edit document -> parse -> chunk -> embed -> upsert into LanceDB with metadata.
  2) Classify document into labels/categories via LLM-assisted classification.
  3) RAG query endpoint retrieves relevant chunks with citations.
  4) Wiki builder compiles per-label/category markdown pages with references to sources.

Planned Repo Structure
- server/                FastAPI app and indexing pipeline
  - app/
    - api/               Routers for documents, query, wiki
    - core/              Settings, dependencies
    - db/                SQLModel models, session, migrations (if any)
    - rag/               Chunking, embeddings, vector store, wiki generator
    - services/          Document parsing, classification, ingestion
    - tests/             Backend unit tests
  - pyproject.toml       Python project config
  - uv.lock or requirements.txt (see instructions)
- web/                   Next.js app
  - app/                 App Router pages: /, /documents, /chat, /wiki
  - components/          UI components
  - lib/                 API client helpers
  - package.json
  - tailwind config
- data/                  Local storage for db/files/vector store (gitignored)
  - files/
  - lancedb/
  - app.db
- .env.example           Environment variables template
- docker-compose.yml     Local dev orchestration
- Makefile               Helpful dev commands
- docs/                  Design docs (owned by Tech Lead)

Key Technology Versions (pin or minimums)
- Python: 3.12+
- FastAPI: ~=0.121.1 (latest as of 2025-11-08)
- SQLModel: >=0.0.27 (supports Pydantic v2)
- Pydantic: v2 series
- Uvicorn: latest stable
- LanceDB: latest stable
- OpenAI Python SDK: v2.x
- tiktoken: latest (for token-aware chunking)
- pypdf, python-docx: latest, for parsing
- Next.js: 16 (App Router)
- Tailwind CSS: v4

Environment Variables
- OPENAI_API_KEY: OpenAI key for embeddings and generation
- RAG_EMBED_MODEL: default text-embedding-3-small
- RAG_GEN_MODEL: default gpt-4o-mini
- DATA_DIR: default ./data
- LANCEDB_DIR: default ./data/lancedb
- FILE_STORAGE_DIR: default ./data/files
- SQLITE_URL: default sqlite:///./data/app.db
- SERVER_PORT: default 8000
- WEB_PORT: default 3000
- BACKEND_URL: default http://localhost:8000 (frontend uses this)

RAG Pipeline Details
- Parsing: Support .txt, .md, .pdf, .docx. Extract normalized plaintext + basic metadata.
- Chunking: Token-aware splitting ~800-1200 tokens with small overlap.
- Embedding: OpenAI text-embedding-3-small (1536 dims). Store vectors + metadata in LanceDB.
- Classification: LLM suggests up to 3–5 labels per doc; user-editable later. Stored in SQL and as vector metadata.
- Query: Hybrid retrieval by text + filters (labels optional). Return answer and citations (document titles and chunk spans).
- Wiki: For each label, gather top chunks across docs; synthesize a markdown article: lead summary, sections, and references strictly citing the user’s content. Update pages when documents change.

API Endpoints (initial)
- POST /documents/upload: multipart upload (single/multiple files)
- POST /documents: create/update a note (title, content, id optional)
- GET /documents, GET /documents/{id}
- POST /query: {query, labels?} -> {answer, citations}
- GET /wiki: list available labels/categories
- GET /wiki/{label}: fetch rendered article (markdown)
- POST /wiki/rebuild (optional): rebuild articles for all labels

Local Dev Commands (expected)
- Server: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
- Web: npm run dev
- Compose: docker compose up --build
- Tests: pytest (server)

Notes for FullStackDeveloper subagents
- Do NOT commit secrets. Provide .env.example and read from .env.
- Keep the simplest working solution; avoid over-engineering.
- Ensure idempotent ingestion (re-uploads update existing records, not duplicate them).
- Always return source references for generated answers.
- Provide basic unit tests for the RAG pipeline (chunker, embed stub with small inputs, simple retrieval) and for API endpoints.
- Validate files by extension and size; handle parsing errors gracefully.

This file (AGENTS.md) and docs/ are maintained by the Technical Lead. Other code changes must be done by FullStackDeveloper subagents.

