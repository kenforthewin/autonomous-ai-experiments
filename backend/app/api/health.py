"""Health check endpoints."""
from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint.
    
    Returns:
        dict: Health status and current timestamp.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

