"""Text processing and chunking utilities."""


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks.
    
    Args:
        text: The text to chunk.
        chunk_size: Size of each chunk in characters.
        overlap: Number of overlapping characters between chunks.
        
    Returns:
        List of text chunks.
    """
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Move start position forward, accounting for overlap
        start = end - overlap
    
    return chunks


def clean_text(text: str) -> str:
    """Clean and normalize text.
    
    Args:
        text: The text to clean.
        
    Returns:
        Cleaned text.
    """
    # Remove extra whitespace
    text = " ".join(text.split())
    
    # Remove control characters but keep newlines
    text = "".join(char for char in text if ord(char) >= 32 or char == "\n")
    
    return text.strip()

