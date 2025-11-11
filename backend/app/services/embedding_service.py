"""Embedding generation and management service."""
from typing import Optional

import chromadb
from langchain_openai import OpenAIEmbeddings

from app.core.config import Settings
from app.core.exceptions import EmbeddingError


class EmbeddingService:
    """Service for generating and managing embeddings."""

    def __init__(self, settings: Settings):
        """Initialize embedding service.
        
        Args:
            settings: Application configuration.
        """
        self.settings = settings
        
        # Initialize OpenAI embeddings
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY
        )
        
        # Initialize ChromaDB persistent client
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )

    def add_document_chunks(
        self,
        doc_id: str,
        chunks: list[str],
        metadatas: list[dict]
    ) -> int:
        """Add document chunks to ChromaDB.
        
        Args:
            doc_id: The document ID.
            chunks: List of text chunks.
            metadatas: List of metadata dictionaries for each chunk.
            
        Returns:
            Number of chunks added.
            
        Raises:
            EmbeddingError: If there's an error adding chunks.
        """
        if not chunks:
            return 0
        
        try:
            # Generate IDs for chunks
            ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
            
            # Ensure all metadata has doc_id
            for i, metadata in enumerate(metadatas):
                metadata["doc_id"] = doc_id
                metadata["chunk_index"] = i
            
            # Add to collection
            self.collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
            
            return len(chunks)
        except Exception as e:
            raise EmbeddingError(f"Failed to add document chunks: {str(e)}")

    def delete_document(self, doc_id: str) -> None:
        """Delete all chunks for a document from ChromaDB.
        
        Args:
            doc_id: The document ID.
        """
        try:
            # Query all chunks for this document
            results = self.collection.get(
                where={"doc_id": {"$eq": doc_id}}
            )
            
            # Delete the chunks
            if results["ids"]:
                self.collection.delete(ids=results["ids"])
        except Exception as e:
            raise EmbeddingError(f"Failed to delete document embeddings: {str(e)}")

    def similarity_search(self, query: str, k: int = 5) -> list[tuple[str, dict]]:
        """Search for similar chunks.
        
        Args:
            query: The search query.
            k: Number of results to return.
            
        Returns:
            List of (text, metadata) tuples.
            
        Raises:
            EmbeddingError: If there's an error during search.
        """
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=k
            )
            
            # Format results as list of (text, metadata) tuples
            chunks = results["documents"][0] if results["documents"] else []
            metadatas = results["metadatas"][0] if results["metadatas"] else []
            
            # Return as list of (text, metadata) tuples
            return list(zip(chunks, metadatas))
        except Exception as e:
            raise EmbeddingError(f"Failed to perform similarity search: {str(e)}")

