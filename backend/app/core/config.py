"""Configuration management for the RAG application."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    API_TITLE: str = "RAG Personal Notes API"
    API_VERSION: str = "1.0.0"
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    
    # Storage Configuration
    CHROMA_DB_PATH: str = "./data/chroma_db"
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes
    
    # Chunking Configuration
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Model Configuration
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_MODEL: str = "gpt-4"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()

