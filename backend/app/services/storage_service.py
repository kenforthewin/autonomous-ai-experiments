"""File storage service."""
import json
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.core.config import Settings
from app.core.exceptions import DocumentNotFoundError


class StorageService:
    """Service for file storage management."""

    def __init__(self, settings: Settings):
        """Initialize storage service.
        
        Args:
            settings: Application configuration.
        """
        self.settings = settings
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.metadata_file = Path(settings.UPLOAD_DIR).parent / "documents_metadata.json"
        
        # Ensure directories exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize metadata file if it doesn't exist
        if not self.metadata_file.exists():
            self.metadata_file.write_text(json.dumps({}))

    def save_file(self, file: UploadFile) -> tuple[str, str, int]:
        """Save an uploaded file.
        
        Args:
            file: The uploaded file.
            
        Returns:
            Tuple of (doc_id, filepath, file_size).
        """
        # Generate UUID for document
        doc_id = str(uuid.uuid4())
        
        # Save file to disk
        file_path = self.upload_dir / f"{doc_id}_{file.filename}"
        
        # Read and save file content
        content = file.file.read()
        file_size = len(content)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        return doc_id, str(file_path), file_size

    def delete_file(self, doc_id: str) -> bool:
        """Delete a file associated with a document.
        
        Args:
            doc_id: The document ID.
            
        Returns:
            True if successful.
            
        Raises:
            DocumentNotFoundError: If file not found.
        """
        metadata = self.get_metadata(doc_id)
        file_path = Path(metadata["filepath"])
        
        if file_path.exists():
            file_path.unlink()
            return True
        
        raise DocumentNotFoundError(f"File for document {doc_id} not found")

    def get_file_path(self, doc_id: str) -> str:
        """Get the file path for a document.
        
        Args:
            doc_id: The document ID.
            
        Returns:
            Path to the file.
            
        Raises:
            DocumentNotFoundError: If document not found.
        """
        metadata = self.get_metadata(doc_id)
        return metadata["filepath"]

    def save_metadata(self, doc_id: str, metadata: dict) -> None:
        """Save document metadata.
        
        Args:
            doc_id: The document ID.
            metadata: The metadata to save.
        """
        all_metadata = self._load_all_metadata()
        all_metadata[doc_id] = metadata
        self._save_all_metadata(all_metadata)

    def get_metadata(self, doc_id: str) -> dict:
        """Get metadata for a document.
        
        Args:
            doc_id: The document ID.
            
        Returns:
            Document metadata.
            
        Raises:
            DocumentNotFoundError: If document not found.
        """
        all_metadata = self._load_all_metadata()
        if doc_id not in all_metadata:
            raise DocumentNotFoundError(f"Document {doc_id} not found")
        return all_metadata[doc_id]

    def get_all_metadata(self) -> list[dict]:
        """Get all document metadata.
        
        Returns:
            List of document metadata dictionaries with id field.
        """
        all_metadata = self._load_all_metadata()
        result = []
        for doc_id, metadata in all_metadata.items():
            metadata_copy = metadata.copy()
            metadata_copy["id"] = doc_id
            result.append(metadata_copy)
        return result

    def delete_metadata(self, doc_id: str) -> None:
        """Delete metadata for a document.
        
        Args:
            doc_id: The document ID.
        """
        all_metadata = self._load_all_metadata()
        if doc_id in all_metadata:
            del all_metadata[doc_id]
            self._save_all_metadata(all_metadata)

    def _load_all_metadata(self) -> dict:
        """Load all metadata from file.
        
        Returns:
            Dictionary of all metadata.
        """
        if not self.metadata_file.exists():
            return {}
        
        try:
            content = self.metadata_file.read_text()
            return json.loads(content) if content else {}
        except json.JSONDecodeError:
            return {}

    def _save_all_metadata(self, metadata: dict) -> None:
        """Save all metadata to file.
        
        Args:
            metadata: The metadata dictionary to save.
        """
        self.metadata_file.write_text(json.dumps(metadata, indent=2, default=str))

