# RAG Backend - FastAPI Application

This is the backend service for the RAG (Retrieval-Augmented Generation) Personal Notes Application built with FastAPI.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── documents.py        # Document upload/management endpoints
│   │   ├── queries.py          # Query/generation endpoints
│   │   └── health.py           # Health check endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   └── dependencies.py     # Dependency injection
│   ├── services/
│   │   ├── __init__.py
│   │   ├── document_service.py # Document processing logic
│   │   ├── embedding_service.py # Embedding generation
│   │   ├── rag_service.py      # RAG query orchestration
│   │   └── storage_service.py  # File storage management
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   └── utils/
│       ├── __init__.py
│       └── text_processing.py  # Text chunking and preprocessing
├── data/
│   ├── uploads/                # Uploaded documents directory
│   └── chroma_db/              # ChromaDB persistence directory
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://0.0.0.0:8000`

## API Endpoints

### Health Check
- `GET /health` - Check server health

### Documents
- `GET /api/documents` - List all documents
- `GET /api/documents/{doc_id}` - Get document details
- `POST /api/documents/upload` - Upload a document
- `DELETE /api/documents/{doc_id}` - Delete a document

### Queries
- `POST /api/query` - Submit a query and get RAG response

## Configuration

All configuration is managed through environment variables in `.env`:

- `OPENAI_API_KEY` - OpenAI API key (required)
- `CHROMA_DB_PATH` - Path to ChromaDB storage (default: `./data/chroma_db`)
- `UPLOAD_DIR` - Path for uploaded files (default: `./data/uploads`)
- `MAX_UPLOAD_SIZE` - Maximum upload size in bytes (default: 10485760)
- `CHUNK_SIZE` - Document chunk size (default: 1000)
- `CHUNK_OVERLAP` - Overlap between chunks (default: 200)
- `EMBEDDING_MODEL` - OpenAI embedding model (default: `text-embedding-3-small`)
- `LLM_MODEL` - OpenAI LLM model (default: `gpt-4`)

## Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Testing

The backend includes validation of all endpoints. To test:

```bash
# Using curl
curl http://localhost:8000/health

# Or use the interactive Swagger UI at /docs
```

## Development

### Code Structure

- **Models** (`models/`): Pydantic schemas for request/response validation
- **Services** (`services/`): Business logic for documents, embeddings, and RAG
- **API** (`api/`): FastAPI route handlers
- **Core** (`core/`): Configuration and dependency injection
- **Utils** (`utils/`): Helper functions for text processing

### Adding New Endpoints

1. Create handlers in `api/` directory
2. Create router with `APIRouter()`
3. Include router in `app/main.py`

## Dependencies

Key dependencies:
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **LangChain**: Document processing and RAG orchestration
- **ChromaDB**: Vector database
- **OpenAI**: Embeddings and LLM
- **pypdf**: PDF processing
- **python-docx**: DOCX processing

See `requirements.txt` for complete list of dependencies with versions.

