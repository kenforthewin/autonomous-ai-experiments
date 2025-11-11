"""Pydantic schemas for request/response models."""
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    """Response model for document upload."""

    id: str = Field(..., description="Unique document identifier")
    filename: str = Field(..., description="Name of the uploaded file")
    file_size: int = Field(..., description="Size of the file in bytes")
    uploaded_at: datetime = Field(..., description="Timestamp of upload")
    chunk_count: int = Field(..., description="Number of chunks created from document")


class DocumentMetadata(BaseModel):
    """Document metadata model."""

    id: str = Field(..., description="Unique document identifier")
    filename: str = Field(..., description="Name of the file")
    file_size: int = Field(..., description="Size of the file in bytes")
    uploaded_at: datetime = Field(..., description="Timestamp of upload")
    chunk_count: int = Field(..., description="Number of chunks created from document")


class SourceDocument(BaseModel):
    """Source document in query response."""

    document_id: str = Field(..., description="Document identifier")
    filename: str = Field(..., description="Document filename")
    content: str = Field(..., description="Relevant content snippet")
    relevance_score: float = Field(..., description="Relevance score (0-1)")


class QueryRequest(BaseModel):
    """Request model for query endpoint."""

    query: str = Field(..., description="The user's query")
    max_results: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of source documents to return"
    )


class QueryResponse(BaseModel):
    """Response model for query endpoint."""

    answer: str = Field(..., description="Generated answer to the query")
    sources: List[SourceDocument] = Field(
        default_factory=list,
        description="Source documents used to generate the answer"
    )

