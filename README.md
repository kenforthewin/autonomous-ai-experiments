# RAG Personal Notes Application

A full-stack Retrieval-Augmented Generation (RAG) application for personal notekeeping and intelligent document summarization. Upload your documents and query them using natural language to generate insights, summaries, and custom content.

## Features

- 📄 **Multi-format Document Support**: Upload PDF, DOCX, TXT, and Markdown files
- 🔍 **Semantic Search**: Find relevant information across all your documents using vector embeddings
- 🤖 **AI-Powered Generation**: Generate summaries, articles, and insights using GPT-4
- 🔗 **Document Connectivity**: Automatically link related documents through semantic similarity
- 💬 **Natural Language Queries**: Ask questions like "Create a Wikipedia-style page about my musings on Greece"
- 📊 **Document Management**: View, organize, and delete your uploaded documents

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - Framework for LLM applications
- **ChromaDB** - Vector database for embeddings
- **OpenAI** - Embeddings (text-embedding-3-small) and Generation (GPT-4)

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- OpenAI API key

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag-personal-notes
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-...

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### Uploading Documents

1. Navigate to the **Documents** tab
2. Drag and drop files or click to browse
3. Supported formats: PDF, DOCX, TXT, MD
4. Maximum file size: 10MB

### Querying Your Documents

1. Navigate to the **Query** tab
2. Enter your question or request, for example:
   - "Summarize all my notes about machine learning"
   - "Create a Wikipedia-style article about Greece based on my documents"
   - "What are the main themes across my documents?"
3. Click **Query Documents**
4. View the AI-generated response with source citations

### Managing Documents

- View all uploaded documents in the **Documents** tab
- See metadata: filename, size, upload date, number of chunks
- Delete documents you no longer need

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Configuration and dependencies
│   │   ├── models/           # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── data/
│   │   ├── uploads/          # Uploaded documents
│   │   └── chroma_db/        # Vector database
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities and API client
│   │   └── types/            # TypeScript types
│   └── package.json
│
├── AGENTS.md                 # Developer documentation
└── README.md                 # This file
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional (defaults shown)
CHROMA_DB_PATH=./data/chroma_db
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE=10485760
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload a new document
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete a document

### Queries
- `POST /api/query` - Submit a query and get AI-generated response

### Health
- `GET /health` - Health check endpoint

## How It Works

### RAG Pipeline

1. **Document Ingestion**:
   - User uploads a document
   - Document is parsed and split into chunks
   - Each chunk is embedded using OpenAI's embedding model
   - Embeddings are stored in ChromaDB with metadata

2. **Query Processing**:
   - User submits a natural language query
   - Query is embedded using the same model
   - ChromaDB performs similarity search to find relevant chunks
   - Top-k most relevant chunks are retrieved

3. **Response Generation**:
   - Retrieved chunks are used as context
   - Context + query are sent to GPT-4
   - LLM generates a comprehensive response
   - Response is returned with source citations

## Development

### Running Tests

Backend:
```bash
cd backend
python test_api.py
```

Frontend:
```bash
cd frontend
npm run build
```

### Building for Production

Backend:
```bash
cd backend
# Backend is ready for production deployment
# Consider using gunicorn or similar ASGI server
```

Frontend:
```bash
cd frontend
npm run build
# Build output will be in the dist/ directory
```

## Troubleshooting

### Backend Issues

**Error: OpenAI API key not found**
- Ensure you have created a `.env` file in the `backend/` directory
- Add your OpenAI API key: `OPENAI_API_KEY=sk-...`

**Error: ChromaDB initialization failed**
- Ensure the `data/chroma_db/` directory is writable
- Try deleting the directory and restarting the server

**Error: Document upload failed**
- Check file size (max 10MB by default)
- Verify file format is supported (PDF, DOCX, TXT, MD)

### Frontend Issues

**Error: Cannot connect to backend**
- Ensure the backend server is running on port 8000
- Check the `VITE_API_URL` in `.env` file
- Verify CORS is enabled in the backend

**Error: Build failed**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## Future Enhancements

- [ ] User authentication and multi-tenancy
- [ ] Document versioning and history
- [ ] Advanced query types (comparisons, timelines)
- [ ] Export functionality for generated content
- [ ] Document tagging and categorization
- [ ] Chat history and conversation memory
- [ ] Support for more document formats (images, audio transcripts)
- [ ] Custom embedding models and LLM providers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [OpenAI](https://openai.com/) and [LangChain](https://langchain.com/)
- Vector storage by [ChromaDB](https://www.trychroma.com/)

