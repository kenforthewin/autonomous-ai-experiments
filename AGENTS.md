# RAG Personal Notes Application

## Project Overview
A Retrieval-Augmented Generation (RAG) application for personal notekeeping and summarization. Users can upload documents, which are ingested and connected with existing documents, enabling intelligent queries like "Create a Wikipedia-style page related to all my musings about Greece."

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Vector Database**: ChromaDB (for embedding storage and retrieval)
- **Embeddings**: OpenAI embeddings (text-embedding-3-small)
- **LLM**: OpenAI GPT-4 (for generation)
- **Document Processing**: LangChain for document loading, chunking, and RAG orchestration
- **File Storage**: Local file system with metadata tracking
- **Dependencies Management**: Poetry or pip with requirements.txt

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios or Fetch API
- **File Upload**: React Dropzone

## Architecture

### Backend Structure
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
│   ├── uploads/                # Uploaded documents
│   └── chroma_db/              # ChromaDB persistence
├── requirements.txt
└── .env.example
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── DocumentUpload.tsx  # Document upload component
│   │   ├── DocumentList.tsx    # List of uploaded documents
│   │   ├── QueryInterface.tsx  # Query input and results display
│   │   └── Layout.tsx          # Main layout component
│   ├── lib/
│   │   ├── api.ts              # API client functions
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Features

1. **Document Upload & Processing**
   - Support for PDF, TXT, DOCX, and Markdown files
   - Automatic text extraction and chunking
   - Embedding generation and vector storage

2. **Document Management**
   - List uploaded documents
   - View document metadata
   - Delete documents

3. **Intelligent Querying**
   - Natural language queries over document collection
   - Contextual retrieval using semantic search
   - LLM-powered generation of summaries, articles, and insights

4. **Document Connectivity**
   - Automatic linking of related documents through semantic similarity
   - Cross-document context awareness

## Common Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Full Stack (Development)
```bash
# Terminal 1 - Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=./data/chroma_db
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete a document

### Queries
- `POST /api/query` - Submit a query and get generated response

### Health
- `GET /health` - Health check endpoint

## Development Guidelines

1. **Code Style**: Follow PEP 8 for Python, ESLint + Prettier for TypeScript
2. **Type Safety**: Use Pydantic for backend validation, TypeScript strict mode for frontend
3. **Error Handling**: Implement comprehensive error handling with appropriate HTTP status codes
4. **Testing**: Write unit tests for services, integration tests for API endpoints
5. **Documentation**: Use docstrings for Python functions, JSDoc for TypeScript

## RAG Pipeline Flow

1. **Ingestion**:
   - User uploads document → FastAPI receives file
   - Document is saved to disk
   - LangChain loads and chunks the document
   - Embeddings are generated via OpenAI
   - Vectors stored in ChromaDB with metadata

2. **Query**:
   - User submits query → FastAPI receives request
   - Query is embedded using same model
   - ChromaDB performs similarity search
   - Relevant chunks retrieved with context
   - LLM generates response using retrieved context
   - Response returned to user

## Future Enhancements
- User authentication and multi-tenancy
- Document versioning
- Advanced query types (summaries, comparisons, timelines)
- Export functionality for generated content
- Document tagging and categorization
- Chat history and conversation memory

