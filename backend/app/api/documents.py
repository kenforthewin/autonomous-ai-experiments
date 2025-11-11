"""Document management endpoints."""
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends

from app.models.schemas import DocumentUploadResponse, DocumentMetadata
from app.services.document_service import DocumentService
from app.core.dependencies import get_document_service
from app.core.exceptions import (
    InvalidFileTypeError,
    FileTooLargeError,
    DocumentNotFoundError
)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_service: DocumentService = Depends(get_document_service)
) -> DocumentUploadResponse:
    """Upload a document for processing.
    
    Args:
        file: The document file to upload.
        document_service: The document service instance.
        
    Returns:
        DocumentUploadResponse: Upload response with document metadata.
        
    Raises:
        HTTPException: If file validation fails or processing error occurs.
    """
    try:
        return await document_service.process_document(file)
    except InvalidFileTypeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileTooLargeError as e:
        raise HTTPException(status_code=413, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("")
async def list_documents(
    document_service: DocumentService = Depends(get_document_service)
) -> List[DocumentMetadata]:
    """List all uploaded documents.
    
    Args:
        document_service: The document service instance.
        
    Returns:
        List[DocumentMetadata]: List of uploaded documents.
    """
    try:
        return document_service.get_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.get("/{doc_id}")
async def get_document(
    doc_id: str,
    document_service: DocumentService = Depends(get_document_service)
) -> DocumentMetadata:
    """Get details of a specific document.
    
    Args:
        doc_id: The document ID.
        document_service: The document service instance.
        
    Returns:
        DocumentMetadata: Document metadata.
        
    Raises:
        HTTPException: If document not found.
    """
    try:
        return document_service.get_document(doc_id)
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving document: {str(e)}")


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    document_service: DocumentService = Depends(get_document_service)
) -> dict:
    """Delete a document.
    
    Args:
        doc_id: The document ID to delete.
        document_service: The document service instance.
        
    Returns:
        dict: Success message.
        
    Raises:
        HTTPException: If document not found.
    """
    try:
        document_service.delete_document(doc_id)
        return {"message": f"Document {doc_id} deleted successfully"}
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

