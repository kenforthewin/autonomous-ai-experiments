"""Dependency injection for FastAPI application."""
from app.core.config import get_settings, Settings


def get_config() -> Settings:
    """Get application configuration.
    
    Returns:
        Settings: The application configuration object.
    """
    return get_settings()

