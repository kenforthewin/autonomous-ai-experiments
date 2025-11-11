# AGENTS: Project Overview and Working Agreements

Purpose
- Build a simple Retrieval Augmented Generation (RAG) application for personal note-keeping and summarization.
- Users can upload documents (txt, md, pdf). Backend ingests, chunks, embeds into a local vector store, and serves a query endpoint to synthesize answers (e.g., "Create a Wikipedia‑style page related to all my musings about Greece").

High-level Architecture (initial)
- Backend: FastAPI (Python 3.12+)
- Vector store: Chroma (local, persisted in ./data/chroma)
- RAG framework: LangChain (2025 modules split: langchain, langchain-community, langchain-openai, langchain-chroma)
- Embeddings: OpenAI text-embedding-3-small (1536 dims)
- LLM: OpenAI Chat (cost-efficient model like gpt-4o-mini); configurable via env
- Storage: save originals to ./data/raw/<doc_id>/
- Minimal UI: Single static HTML page served by FastAPI for upload and querying (phase 1). React SPA can be added later.

Key Endpoints (v1)
- POST /api/v1/upload: multipart file upload; optional tags. Returns doc_id and counts.
- POST /api/v1/query: body { query: str, top_k?: int, tags?: [str] }. Returns synthesized markdown with citations and list of sources.
- GET /api/v1/health
- GET / (serves minimal web UI).

Data Model (initial)
- Document: doc_id (uuid), title, source_paths, created_at, tags (list), summary (optional)
- Chunk metadata stored in Chroma: { doc_id, title, path, page (for pdf), tags, created_at, chunk_id }

Directories
- app/             # FastAPI app and services
  - api/
  - services/
  - db/
  - config.py
  - main.py
- data/
  - raw/           # original files stored by doc_id
  - chroma/        # Chroma persist_directory
- tests/
- docs/

Environment
- OPENAI_API_KEY: required
- OPENAI_MODEL: default gpt-4o-mini (configurable)
- EMBEDDING_MODEL: default text-embedding-3-small
- CHROMA_DIR: default ./data/chroma

Local Dev Quickstart (expected after bootstrap)
- python -m venv .venv && source .venv/bin/activate
- pip install -r requirements.txt
- cp .env.example .env  # and set your OPENAI_API_KEY
- uvicorn app.main:app --reload

Coding Conventions
- Use Pydantic v2 models for request/response schemas
- Use langchain_openai.ChatOpenAI and OpenAIEmbeddings
- Use langchain_chroma.Chroma with persist_directory under ./data/chroma
- Chunking: RecursiveCharacterTextSplitter chunk_size=1000, chunk_overlap=200 (tune later)
- Retrieval: similarity with MMR, fetch_k≈20, k≈8; include source metadata and inline citations in final answer

Testing
- pytest for unit tests and httpx-based API tests
- For tests that need embeddings/LLM, mock or gate behind env var USE_OPENAI_FOR_TESTS=false by default

Non-Goals (phase 1)
- Heavy document parsing frameworks (unstructured) and OCR
- Advanced reranking and graph linking
- Multi-user auth

You (FullStackDeveloper) Must
- Adhere to versions/imports compatible with late 2025 package split (langchain-openai, langchain-chroma, langchain-community)
- Build and test before finishing your task; include instructions and any decisions in commit messages
- Keep all files within this repository root
- Put persisted data under ./data/


