"""RAG (Retrieval-Augmented Generation) service."""
from langchain_openai import ChatOpenAI

from app.core.config import Settings
from app.models.schemas import QueryResponse, SourceDocument
from app.services.embedding_service import EmbeddingService
from app.core.exceptions import EmbeddingError


class RAGService:
    """Service for RAG query processing."""

    def __init__(self, settings: Settings, embedding_service: EmbeddingService):
        """Initialize RAG service.
        
        Args:
            settings: Application configuration.
            embedding_service: EmbeddingService instance.
        """
        self.settings = settings
        self.embedding_service = embedding_service
        
        # Initialize ChatOpenAI
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
        )

    def query(self, query_text: str, max_results: int = 5) -> QueryResponse:
        """Process a query using RAG.
        
        Args:
            query_text: The user's query.
            max_results: Maximum number of source documents to retrieve.
            
        Returns:
            QueryResponse with answer and sources.
        """
        # Retrieve similar chunks
        search_results = self.embedding_service.similarity_search(query_text, k=max_results)
        
        # Extract context and source information
        context_parts = []
        source_documents = []
        seen_sources = set()
        
        for chunk_text, metadata in search_results:
            context_parts.append(chunk_text)
            
            # Create source document info (avoid duplicates)
            source_key = f"{metadata.get('doc_id', 'unknown')}"
            if source_key not in seen_sources:
                seen_sources.add(source_key)
                source_documents.append(SourceDocument(
                    document_id=metadata.get("doc_id", "unknown"),
                    filename=metadata.get("filename", metadata.get("source", "unknown")),
                    content=chunk_text[:200],  # Truncate for preview
                    relevance_score=0.9  # Placeholder - ChromaDB doesn't return scores directly
                ))
        
        # Construct prompt
        context = "\n\n".join(context_parts)
        
        if context.strip():
            prompt = (
                f"Based on the following context from the user's documents, {query_text}\n\n"
                f"Context:\n{context}\n\n"
                f"Provide a comprehensive answer based on the context above. "
                f"If the context doesn't contain relevant information, say so."
            )
        else:
            prompt = (
                f"The user has no documents uploaded. They asked: {query_text}\n\n"
                f"Please let them know that no documents are available to search."
            )
        
        # Generate answer
        try:
            response = self.llm.invoke(prompt)
            answer = response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            answer = f"Error generating response: {str(e)}"
        
        return QueryResponse(
            answer=answer,
            sources=source_documents
        )

