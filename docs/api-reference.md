# API Reference

Complete reference for the RAG Personal Notes API.

## Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

## Authentication

Currently, no authentication is required. Future versions will implement JWT-based authentication.

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-11T12:00:00.000000"
}
```

**Status Codes**
- `200 OK`: API is healthy

---

### Document Management

#### POST /api/documents/upload

Upload a new document for processing.

**Request**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File to upload (required)

**Supported File Types**
- PDF (`.pdf`)
- Word Documents (`.docx`)
- Text files (`.txt`)
- Markdown (`.md`)

**File Size Limit**
- Default: 10MB
- Configurable via `MAX_UPLOAD_SIZE` environment variable

**Example Request (cURL)**
```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -F "file=@/path/to/document.pdf"
```

**Example Request (JavaScript)**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/documents/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "file_size": 1048576,
  "uploaded_at": "2024-11-11T12:00:00.000000",
  "chunk_count": 42
}
```

**Status Codes**
- `200 OK`: Document uploaded and processed successfully
- `400 Bad Request`: Invalid file type
- `413 Payload Too Large`: File exceeds size limit
- `500 Internal Server Error`: Processing error

**Error Response**
```json
{
  "detail": "Invalid file type. Supported types: pdf, docx, txt, md"
}
```

---

#### GET /api/documents

Retrieve a list of all uploaded documents.

**Example Request (cURL)**
```bash
curl http://localhost:8000/api/documents
```

**Example Request (JavaScript)**
```javascript
const response = await fetch('http://localhost:8000/api/documents');
const documents = await response.json();
```

**Response**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "document1.pdf",
    "file_size": 1048576,
    "uploaded_at": "2024-11-11T12:00:00.000000",
    "chunk_count": 42
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "filename": "notes.txt",
    "file_size": 2048,
    "uploaded_at": "2024-11-11T13:00:00.000000",
    "chunk_count": 5
  }
]
```

**Status Codes**
- `200 OK`: Success

---

#### GET /api/documents/{doc_id}

Retrieve metadata for a specific document.

**Path Parameters**
- `doc_id`: Document UUID (required)

**Example Request (cURL)**
```bash
curl http://localhost:8000/api/documents/550e8400-e29b-41d4-a716-446655440000
```

**Example Request (JavaScript)**
```javascript
const docId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:8000/api/documents/${docId}`);
const document = await response.json();
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "file_size": 1048576,
  "uploaded_at": "2024-11-11T12:00:00.000000",
  "chunk_count": 42
}
```

**Status Codes**
- `200 OK`: Success
- `404 Not Found`: Document does not exist

---

#### DELETE /api/documents/{doc_id}

Delete a document and all associated data.

**Path Parameters**
- `doc_id`: Document UUID (required)

**Example Request (cURL)**
```bash
curl -X DELETE http://localhost:8000/api/documents/550e8400-e29b-41d4-a716-446655440000
```

**Example Request (JavaScript)**
```javascript
const docId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:8000/api/documents/${docId}`, {
  method: 'DELETE'
});
```

**Response**
```json
{
  "message": "Document deleted successfully"
}
```

**Status Codes**
- `200 OK`: Document deleted successfully
- `404 Not Found`: Document does not exist

**Note**: This operation:
- Deletes the file from storage
- Removes all embeddings from ChromaDB
- Removes metadata
- Cannot be undone

---

### Query

#### POST /api/query

Submit a natural language query to search and generate responses from your documents.

**Request Body**
```json
{
  "query": "Create a Wikipedia-style article about Greece based on my notes",
  "max_results": 5
}
```

**Parameters**
- `query` (string, required): Natural language query
- `max_results` (integer, optional): Number of document chunks to retrieve (default: 5)

**Example Request (cURL)**
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize my notes about machine learning",
    "max_results": 5
  }'
```

**Example Request (JavaScript)**
```javascript
const response = await fetch('http://localhost:8000/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Summarize my notes about machine learning',
    max_results: 5
  })
});

const result = await response.json();
```

**Response**
```json
{
  "answer": "Based on your notes, machine learning is...",
  "sources": [
    {
      "doc_id": "550e8400-e29b-41d4-a716-446655440000",
      "source": "ml-notes.pdf",
      "chunk_index": 0
    },
    {
      "doc_id": "550e8400-e29b-41d4-a716-446655440001",
      "source": "deep-learning.txt",
      "chunk_index": 2
    }
  ]
}
```

**Status Codes**
- `200 OK`: Query processed successfully
- `400 Bad Request`: Empty or invalid query
- `500 Internal Server Error`: Processing error

**Example Queries**

1. **Summarization**
   ```json
   {"query": "Summarize all my notes about Python programming"}
   ```

2. **Article Generation**
   ```json
   {"query": "Create a Wikipedia-style article about Greece based on my travel notes"}
   ```

3. **Question Answering**
   ```json
   {"query": "What did I write about neural networks?"}
   ```

4. **Comparison**
   ```json
   {"query": "Compare my notes on React vs Vue"}
   ```

5. **Timeline**
   ```json
   {"query": "Create a timeline of events mentioned in my history notes"}
   ```

---

## Data Models

### DocumentMetadata

```typescript
{
  id: string;              // UUID
  filename: string;        // Original filename
  file_size: number;       // Size in bytes
  uploaded_at: string;     // ISO 8601 timestamp
  chunk_count: number;     // Number of chunks created
}
```

### QueryRequest

```typescript
{
  query: string;           // Natural language query
  max_results?: number;    // Optional, default: 5
}
```

### QueryResponse

```typescript
{
  answer: string;          // Generated response
  sources: DocumentSource[]; // Source citations
}
```

### DocumentSource

```typescript
{
  doc_id: string;          // Document UUID
  source: string;          // Source filename
  chunk_index: number;     // Chunk number in document
}
```

## Error Handling

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File too large
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Example Error Responses

**Invalid File Type**
```json
{
  "detail": "Invalid file type. Supported types: pdf, docx, txt, md"
}
```

**File Too Large**
```json
{
  "detail": "File too large. Maximum size: 10485760 bytes"
}
```

**Document Not Found**
```json
{
  "detail": "Document not found"
}
```

**Empty Query**
```json
{
  "detail": "Query cannot be empty"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse and manage OpenAI API costs.

**Recommended Limits**:
- Document uploads: 10 per hour per IP
- Queries: 30 per hour per IP

## CORS

In development, CORS is configured to allow all origins. In production, configure `CORS_ORIGINS` environment variable to restrict to your frontend domain.

## Interactive Documentation

The API includes interactive Swagger UI documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These interfaces allow you to:
- Explore all endpoints
- View request/response schemas
- Test API calls directly from the browser
- Download OpenAPI specification

## Code Examples

### Python

```python
import requests

# Upload document
with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/documents/upload',
        files={'file': f}
    )
    doc = response.json()
    print(f"Uploaded: {doc['id']}")

# Query documents
response = requests.post(
    'http://localhost:8000/api/query',
    json={
        'query': 'Summarize my notes',
        'max_results': 5
    }
)
result = response.json()
print(result['answer'])

# List documents
response = requests.get('http://localhost:8000/api/documents')
documents = response.json()
for doc in documents:
    print(f"{doc['filename']}: {doc['chunk_count']} chunks")

# Delete document
requests.delete(f"http://localhost:8000/api/documents/{doc['id']}")
```

### JavaScript/TypeScript

```typescript
// Upload document
const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/api/documents/upload', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Query documents
const queryDocuments = async (query: string) => {
  const response = await fetch('http://localhost:8000/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, max_results: 5 })
  });
  
  return await response.json();
};

// List documents
const getDocuments = async () => {
  const response = await fetch('http://localhost:8000/api/documents');
  return await response.json();
};

// Delete document
const deleteDocument = async (docId: string) => {
  await fetch(`http://localhost:8000/api/documents/${docId}`, {
    method: 'DELETE'
  });
};
```

## Best Practices

1. **File Uploads**
   - Validate file types on client-side before upload
   - Show upload progress for better UX
   - Handle errors gracefully

2. **Queries**
   - Provide example queries to guide users
   - Show loading states during processing
   - Display source citations for transparency

3. **Error Handling**
   - Always check response status codes
   - Display user-friendly error messages
   - Implement retry logic for transient failures

4. **Performance**
   - Cache query results when appropriate
   - Debounce query inputs
   - Use pagination for large document lists (future)

5. **Security**
   - Never expose OpenAI API key to frontend
   - Validate and sanitize all inputs
   - Implement rate limiting in production

