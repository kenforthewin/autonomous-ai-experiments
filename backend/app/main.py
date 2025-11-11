"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import (
    DocumentNotFoundError,
    InvalidFileTypeError,
    FileTooLargeError,
    EmbeddingError
)
from app.api import health, documents, queries


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    # Startup
    startup_event()
    yield
    # Shutdown
    # Add any cleanup logic here if needed


def startup_event():
    """Handle startup events."""
    # Create data directories if they don't exist
    os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI instance.
    """
    app = FastAPI(
        title=settings.API_TITLE,
        version=settings.API_VERSION,
        lifespan=lifespan
    )

    # Add CORS middleware for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for development
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add exception handlers
    @app.exception_handler(DocumentNotFoundError)
    async def document_not_found_handler(request: Request, exc: DocumentNotFoundError):
        return JSONResponse(
            status_code=404,
            content={"detail": str(exc)}
        )

    @app.exception_handler(InvalidFileTypeError)
    async def invalid_file_type_handler(request: Request, exc: InvalidFileTypeError):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)}
        )

    @app.exception_handler(FileTooLargeError)
    async def file_too_large_handler(request: Request, exc: FileTooLargeError):
        return JSONResponse(
            status_code=413,
            content={"detail": str(exc)}
        )

    @app.exception_handler(EmbeddingError)
    async def embedding_error_handler(request: Request, exc: EmbeddingError):
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)}
        )

    # Include routers
    app.include_router(health.router)
    app.include_router(documents.router)
    app.include_router(queries.router)

    return app


# Create the app instance
app = create_app()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to RAG Personal Notes API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }

