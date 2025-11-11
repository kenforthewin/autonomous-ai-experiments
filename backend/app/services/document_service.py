"""Document processing service."""
import os
from datetime import datetime
from pathlib import Path

from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.core.config import Settings
from app.core.exceptions import InvalidFileTypeError, FileTooLargeError, DocumentNotFoundError
from app.models.schemas import DocumentUploadResponse, DocumentMetadata
from app.services.storage_service import StorageService
from app.services.embedding_service import EmbeddingService


class DocumentService:
    """Service for document processing and management."""

    # Supported file types
    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

    def __init__(self, settings: Settings, storage_service: StorageService, embedding_service: EmbeddingService):
        """Initialize document service.
        
        Args:
            settings: Application configuration.
            storage_service: StorageService instance.
            embedding_service: EmbeddingService instance.
        """
        self.settings = settings
        self.storage_service = storage_service
        self.embedding_service = embedding_service
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", ""]
        )

    async def process_document(self, file: UploadFile) -> DocumentUploadResponse:
        """Process an uploaded document.
        
        Args:
            file: The uploaded file.
            
        Returns:
            DocumentUploadResponse with document metadata.
            
        Raises:
            InvalidFileTypeError: If file type is not supported.
            FileTooLargeError: If file exceeds max size.
        """
        # Validate file type
        if not file.filename:
            raise InvalidFileTypeError("File must have a filename")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in self.SUPPORTED_EXTENSIONS:
            raise InvalidFileTypeError(
                f"Unsupported file type: {file_ext}. "
                f"Supported types: {', '.join(self.SUPPORTED_EXTENSIONS)}"
            )
        
        # Validate file size
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > self.settings.MAX_UPLOAD_SIZE:
            raise FileTooLargeError(
                f"File size ({file_size} bytes) exceeds maximum "
                f"({self.settings.MAX_UPLOAD_SIZE} bytes)"
            )
        
        # Save file
        doc_id, file_path, saved_size = self.storage_service.save_file(file)
        
        try:
            # Load document based on file type
            documents = self._load_document(file_path, file_ext)
            
            # Combine all documents and extract text
            full_text = "\n".join([doc.page_content for doc in documents])
            
            # Split into chunks
            chunks = self.text_splitter.split_text(full_text)
            
            # Create metadata for each chunk
            metadatas = [
                {
                    "source": file.filename,
                    "filename": file.filename
                }
                for _ in chunks
            ]
            
            # Add chunks to embeddings
            chunk_count = self.embedding_service.add_document_chunks(doc_id, chunks, metadatas)
            
            # Save document metadata
            metadata = {
                "filename": file.filename,
                "filepath": file_path,
                "file_size": saved_size,
                "uploaded_at": datetime.now().isoformat(),
                "chunk_count": chunk_count
            }
            self.storage_service.save_metadata(doc_id, metadata)
            
            return DocumentUploadResponse(
                id=doc_id,
                filename=file.filename,
                file_size=saved_size,
                uploaded_at=datetime.now(),
                chunk_count=chunk_count
            )
        except Exception as e:
            # Clean up on error
            try:
                self.storage_service.delete_file(doc_id)
            except:
                pass
            raise

    def get_documents(self) -> list[DocumentMetadata]:
        """Get all documents.
        
        Returns:
            List of DocumentMetadata objects.
        """
        all_metadata = self.storage_service.get_all_metadata()
        
        result = []
        for metadata in all_metadata:
            doc_id = metadata.pop("id")
            # Convert ISO format string back to datetime
            uploaded_at = metadata["uploaded_at"]
            if isinstance(uploaded_at, str):
                from datetime import datetime
                uploaded_at = datetime.fromisoformat(uploaded_at)
            
            result.append(DocumentMetadata(
                id=doc_id,
                filename=metadata["filename"],
                file_size=metadata["file_size"],
                uploaded_at=uploaded_at,
                chunk_count=metadata["chunk_count"]
            ))
        
        return result

    def get_document(self, doc_id: str) -> DocumentMetadata:
        """Get a specific document.
        
        Args:
            doc_id: The document ID.
            
        Returns:
            DocumentMetadata for the document.
            
        Raises:
            DocumentNotFoundError: If document not found.
        """
        metadata = self.storage_service.get_metadata(doc_id)
        
        # Convert ISO format string back to datetime
        uploaded_at = metadata["uploaded_at"]
        if isinstance(uploaded_at, str):
            from datetime import datetime
            uploaded_at = datetime.fromisoformat(uploaded_at)
        
        return DocumentMetadata(
            id=doc_id,
            filename=metadata["filename"],
            file_size=metadata["file_size"],
            uploaded_at=uploaded_at,
            chunk_count=metadata["chunk_count"]
        )

    def delete_document(self, doc_id: str) -> None:
        """Delete a document.
        
        Args:
            doc_id: The document ID.
            
        Raises:
            DocumentNotFoundError: If document not found.
        """
        # Delete from embeddings
        self.embedding_service.delete_document(doc_id)
        
        # Delete file
        self.storage_service.delete_file(doc_id)
        
        # Delete metadata
        self.storage_service.delete_metadata(doc_id)

    def _load_document(self, file_path: str, file_ext: str) -> list:
        """Load a document using the appropriate loader.
        
        Args:
            file_path: Path to the file.
            file_ext: File extension.
            
        Returns:
            List of langchain Document objects.
        """
        if file_ext == ".pdf":
            loader = PyPDFLoader(file_path)
        elif file_ext == ".docx":
            loader = Docx2txtLoader(file_path)
        elif file_ext in {".txt", ".md"}:
            loader = TextLoader(file_path, encoding="utf-8")
        else:
            raise InvalidFileTypeError(f"Unsupported file type: {file_ext}")
        
        return loader.load()

