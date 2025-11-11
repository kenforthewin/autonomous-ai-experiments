# System Architecture

## Overview

The RAG Personal Notes Application is a full-stack system that combines a FastAPI backend with a React frontend to provide an intelligent document management and querying system powered by retrieval-augmented generation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite + shadcn/ui               │   │
│  │  - DocumentUpload Component                          │   │
│  │  - DocumentList Component                            │   │
│  │  - QueryInterface Component                          │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ HTTP/REST (Axios)                     │
└─────────────────────┼───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Backend API                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FastAPI + Pydantic                                  │   │
│  │  - Documents Endpoints                               │   │
│  │  - Query Endpoint                                    │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  Service Layer                                       │   │
│  │  ┌────────────────┐  ┌─────────────────┐            │   │
│  │  │ DocumentService│  │ RAGService      │            │   │
│  │  └────────┬───────┘  └────────┬────────┘            │   │
│  │           │                    │                     │   │
│  │  ┌────────▼───────┐  ┌────────▼────────┐            │   │
│  │  │StorageService  │  │EmbeddingService │            │   │
│  │  └────────────────┘  └─────────────────┘            │   │
│  └─────────────────┬──────────────┬────────────────────┘   │
└────────────────────┼──────────────┼────────────────────────┘
                     │              │
          ┌──────────▼────┐  ┌─────▼──────────┐
          │ File System   │  │ ChromaDB       │
          │ (documents)   │  │ (vectors)      │
          └───────────────┘  └────────┬───────┘
                                      │
                             ┌────────▼────────┐
                             │ OpenAI API      │
                             │ - Embeddings    │
                             │ - GPT-4         │
                             └─────────────────┘
```

## Component Details

### Frontend Layer

**Technology**: React 18 + TypeScript + Vite + shadcn/ui

**Responsibilities**:
- User interface and interaction
- File upload handling
- Document list display and management
- Query input and response rendering
- State management
- API communication

**Key Components**:
1. **Layout**: Application shell with header and navigation
2. **DocumentUpload**: Drag-and-drop file upload with validation
3. **DocumentList**: Display and manage uploaded documents
4. **QueryInterface**: Natural language query input and results

### API Layer

**Technology**: FastAPI + Pydantic

**Responsibilities**:
- HTTP request/response handling
- Input validation
- Authentication (future)
- Error handling and logging
- CORS configuration

**Endpoints**:
- `POST /api/documents/upload` - Document upload
- `GET /api/documents` - List documents
- `GET /api/documents/{id}` - Get document
- `DELETE /api/documents/{id}` - Delete document
- `POST /api/query` - Submit query
- `GET /health` - Health check

### Service Layer

**1. DocumentService**
- Orchestrates document processing workflow
- Coordinates between storage, embedding, and text processing
- Handles document lifecycle (create, read, delete)

**2. StorageService**
- File system operations
- Metadata persistence (JSON)
- File path management
- UUID generation for documents

**3. EmbeddingService**
- ChromaDB client management
- Vector storage and retrieval
- Embedding generation via OpenAI
- Similarity search operations

**4. RAGService**
- Query orchestration
- Context retrieval from embeddings
- LLM prompt construction
- Response generation via GPT-4

### Data Layer

**1. File System**
- Location: `backend/data/uploads/`
- Stores: Original uploaded documents
- Format: Original file formats (PDF, DOCX, TXT, MD)

**2. Metadata Store**
- Location: `backend/data/documents_metadata.json`
- Stores: Document metadata (filename, size, dates, chunk count)
- Format: JSON

**3. Vector Database (ChromaDB)**
- Location: `backend/data/chroma_db/`
- Stores: Document chunk embeddings and metadata
- Format: ChromaDB persistent storage

**4. External APIs**
- **OpenAI Embeddings**: text-embedding-3-small model
- **OpenAI LLM**: GPT-4 for generation

## Data Flow

### Document Upload Flow

```
1. User uploads file via DocumentUpload component
   ↓
2. Frontend sends file to POST /api/documents/upload
   ↓
3. DocumentService.process_document():
   a. StorageService saves file to disk
   b. LangChain loader parses document
   c. RecursiveCharacterTextSplitter chunks text
   d. EmbeddingService generates embeddings
   e. Embeddings stored in ChromaDB
   f. Metadata saved to JSON
   ↓
4. Response returned with document metadata
   ↓
5. Frontend updates document list
```

### Query Flow

```
1. User enters query in QueryInterface
   ↓
2. Frontend sends query to POST /api/query
   ↓
3. RAGService.query():
   a. Query is embedded using OpenAI
   b. EmbeddingService performs similarity search in ChromaDB
   c. Top-k relevant chunks retrieved
   d. Chunks formatted as context
   e. Prompt constructed with context + query
   f. GPT-4 generates response
   g. Response packaged with source citations
   ↓
4. Response returned to frontend
   ↓
5. QueryInterface displays answer and sources
```

### Document Delete Flow

```
1. User clicks delete on document
   ↓
2. Frontend sends DELETE /api/documents/{id}
   ↓
3. DocumentService.delete_document():
   a. EmbeddingService removes chunks from ChromaDB
   b. StorageService deletes file from disk
   c. StorageService removes metadata from JSON
   ↓
4. Success response returned
   ↓
5. Frontend refreshes document list
```

## Key Design Decisions

### 1. Vector Database Choice: ChromaDB
- **Why**: Lightweight, Python-native, easy to embed
- **Alternatives**: Pinecone (cloud), Weaviate (complex setup), Qdrant (heavier)
- **Trade-offs**: Not as scalable as distributed solutions, but perfect for single-user app

### 2. LLM Provider: OpenAI
- **Why**: Best quality responses, reliable API, good documentation
- **Alternatives**: Anthropic Claude, local models (Llama)
- **Trade-offs**: Cost per query, requires API key, data sent to third party

### 3. Embedding Model: text-embedding-3-small
- **Why**: Good balance of quality and cost, 1536 dimensions
- **Alternatives**: text-embedding-3-large (better but more expensive), ada-002 (older)
- **Trade-offs**: Slightly less accurate than large model, but faster and cheaper

### 4. Frontend Framework: React + Vite
- **Why**: Fast development, modern tooling, great ecosystem
- **Alternatives**: Vue, Svelte, Next.js
- **Trade-offs**: More boilerplate than some alternatives, but most familiar

### 5. UI Library: shadcn/ui
- **Why**: Copy-paste components, full customization, no runtime dependency
- **Alternatives**: Material-UI (heavier), Chakra UI (less flexible)
- **Trade-offs**: Manual component addition, but maximum control

### 6. Text Chunking Strategy: Recursive Character Splitter
- **Why**: Semantic awareness, respects paragraphs and sentences
- **Configuration**: 1000 chars per chunk, 200 char overlap
- **Trade-offs**: May split mid-concept sometimes, but generally good

## Scalability Considerations

### Current Limitations
- Single-user design (no authentication)
- ChromaDB not optimized for millions of documents
- File storage on local disk
- Synchronous processing (blocking uploads)

### Future Enhancements for Scale
1. **Multi-tenancy**: Add user authentication and document isolation
2. **Cloud Storage**: S3/GCS for documents instead of local disk
3. **Distributed Vector DB**: Migrate to Pinecone or Qdrant Cloud
4. **Async Processing**: Background jobs for document ingestion
5. **Caching**: Redis for frequent queries
6. **Database**: PostgreSQL for metadata instead of JSON
7. **Load Balancing**: Multiple backend instances
8. **CDN**: Frontend served via CDN

## Security Considerations

### Current Security
- CORS enabled for development (all origins)
- File type validation
- File size limits
- No user data collected

### Production Recommendations
1. **Authentication**: JWT-based auth
2. **CORS**: Restrict to specific origins
3. **Rate Limiting**: Prevent API abuse
4. **Input Sanitization**: Validate all inputs
5. **HTTPS**: Encrypt in transit
6. **API Key Security**: Vault or secrets manager
7. **File Scanning**: Malware detection
8. **Audit Logging**: Track all operations

## Monitoring and Observability

### Recommended Additions
1. **Logging**: Structured logging with levels
2. **Metrics**: Prometheus + Grafana
3. **Tracing**: OpenTelemetry for request tracing
4. **Error Tracking**: Sentry or similar
5. **Uptime Monitoring**: Health check pings
6. **Cost Tracking**: OpenAI API usage monitoring

## Testing Strategy

### Backend Testing
- Unit tests for services
- Integration tests for API endpoints
- Mock OpenAI calls for tests
- Fixture data for ChromaDB tests

### Frontend Testing
- Component tests with React Testing Library
- E2E tests with Playwright
- Mock API responses
- Visual regression tests

### Current State
- Manual testing via test_api.py
- No automated test suite yet
- Recommended to add before production

