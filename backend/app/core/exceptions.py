"""Custom exceptions for the RAG application."""


class DocumentNotFoundError(Exception):
    """Raised when a document is not found."""
    pass


class InvalidFileTypeError(Exception):
    """Raised when an invalid file type is uploaded."""
    pass


class FileTooLargeError(Exception):
    """Raised when an uploaded file exceeds the size limit."""
    pass


class EmbeddingError(Exception):
    """Raised when there's an error generating embeddings."""
    pass

