"""Dependency injection for FastAPI application."""
from app.core.config import get_settings, Settings
from app.services.storage_service import StorageService
from app.services.embedding_service import EmbeddingService
from app.services.document_service import DocumentService
from app.services.rag_service import RAGService


def get_config() -> Settings:
    """Get application configuration.
    
    Returns:
        Settings: The application configuration object.
    """
    return get_settings()


def get_storage_service() -> StorageService:
    """Get storage service instance.
    
    Returns:
        StorageService: The storage service instance.
    """
    settings = get_settings()
    return StorageService(settings)


def get_embedding_service() -> EmbeddingService:
    """Get embedding service instance.
    
    Returns:
        EmbeddingService: The embedding service instance.
    """
    settings = get_settings()
    return EmbeddingService(settings)


def get_document_service() -> DocumentService:
    """Get document service instance.
    
    Returns:
        DocumentService: The document service instance.
    """
    settings = get_settings()
    storage_service = get_storage_service()
    embedding_service = get_embedding_service()
    return DocumentService(settings, storage_service, embedding_service)


def get_rag_service() -> RAGService:
    """Get RAG service instance.
    
    Returns:
        RAGService: The RAG service instance.
    """
    settings = get_settings()
    embedding_service = get_embedding_service()
    return RAGService(settings, embedding_service)

