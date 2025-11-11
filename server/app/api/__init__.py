from fastapi import APIRouter

from app.api import documents, health, query, wiki

router = APIRouter()

router.include_router(health.router)
router.include_router(documents.router)
router.include_router(query.router)
router.include_router(wiki.router)

