from __future__ import annotations

import hashlib
import math
from typing import Iterable

from tenacity import retry, stop_after_attempt, wait_exponential

from openai import OpenAI

from app.core.config import get_settings


_VECTOR_DIMENSION = 1536


def _should_use_offline() -> bool:
    settings = get_settings()
    return settings.offline_mode or not settings.openai_api_key


def _normalize_vector(values: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in values))
    if norm == 0:
        return [0.0 for _ in values]
    return [value / norm for value in values]


def get_embeddings_offline(texts: Iterable[str]) -> list[list[float]]:
    vectors: list[list[float]] = []
    for text in texts:
        seed = hashlib.sha256(text.encode("utf-8")).digest()
        buffer = bytearray(seed)
        counter = 0
        # Each dimension uses 4 bytes to generate a float in [-1, 1]
        required_bytes = _VECTOR_DIMENSION * 4
        current_digest = seed
        while len(buffer) < required_bytes:
            counter_bytes = counter.to_bytes(4, "big", signed=False)
            current_digest = hashlib.sha256(current_digest + counter_bytes).digest()
            buffer.extend(current_digest)
            counter += 1
        values: list[float] = []
        for idx in range(_VECTOR_DIMENSION):
            start = idx * 4
            chunk = buffer[start : start + 4]
            integer = int.from_bytes(chunk, "big", signed=False)
            scaled = (integer / 0xFFFFFFFF) * 2 - 1
            values.append(scaled)
        vectors.append(_normalize_vector(values))
    return vectors


def _get_client() -> OpenAI:
    settings = get_settings()
    if _should_use_offline():
        raise RuntimeError("OpenAI client requested while offline")
    return OpenAI(api_key=settings.openai_api_key)


@retry(wait=wait_exponential(multiplier=1, min=1, max=10), stop=stop_after_attempt(3))
def _get_embeddings_online(texts: list[str]) -> list[list[float]]:
    client = _get_client()
    settings = get_settings()
    response = client.embeddings.create(
        model=settings.rag_embed_model,
        input=texts,
    )
    return [datum.embedding for datum in response.data]


def get_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    if _should_use_offline():
        return get_embeddings_offline(texts)
    try:
        return _get_embeddings_online(texts)
    except Exception:
        # Fallback to offline embeddings in case of API errors
        return get_embeddings_offline(texts)

