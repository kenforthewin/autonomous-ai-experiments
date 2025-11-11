"""Query processing endpoints."""
from fastapi import APIRouter, HTTPException, Depends

from app.models.schemas import QueryRequest, QueryResponse
from app.services.rag_service import RAGService
from app.core.dependencies import get_rag_service

router = APIRouter(prefix="/api", tags=["queries"])


@router.post("/query")
async def query_documents(
    request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service)
) -> QueryResponse:
    """Submit a query over document collection.
    
    Args:
        request: The query request with query text and parameters.
        rag_service: The RAG service instance.
        
    Returns:
        QueryResponse: Generated answer with source documents.
        
    Raises:
        HTTPException: If query is invalid or processing error occurs.
    """
    # Validate query
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        return rag_service.query(
            query_text=request.query,
            max_results=request.max_results
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

