from __future__ import annotations

from typing import Iterable

from tenacity import retry, stop_after_attempt, wait_exponential

from openai import OpenAI

from app.core.config import get_settings


def _get_client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the environment")
    return OpenAI(api_key=settings.openai_api_key)


@retry(wait=wait_exponential(multiplier=1, min=1, max=10), stop=stop_after_attempt(3))
def get_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    client = _get_client()
    settings = get_settings()

    response = client.embeddings.create(
        model=settings.rag_embed_model,
        input=texts,
    )

    return [datum.embedding for datum in response.data]

