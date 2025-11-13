from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import tiktoken

_DEFAULT_TOKENIZER = "cl100k_base"


@dataclass(slots=True)
class ChunkingConfig:
    target_tokens: int = 1000
    overlap_tokens: int = 100


def _get_tokenizer() -> tiktoken.Encoding:
    return tiktoken.get_encoding(_DEFAULT_TOKENIZER)


def chunk_text(text: str, target_tokens: int = 1000, overlap: int = 100) -> list[str]:
    if target_tokens <= 0:
        raise ValueError("target_tokens must be positive")
    if overlap < 0:
        raise ValueError("overlap must be non-negative")

    tokenizer = _get_tokenizer()
    tokens = tokenizer.encode(text)

    if not tokens:
        return []

    chunks: list[str] = []
    start = 0
    length = len(tokens)
    while start < length:
        end = min(start + target_tokens, length)
        chunk_tokens = tokens[start:end]
        chunk_text_str = tokenizer.decode(chunk_tokens)
        chunks.append(chunk_text_str)
        if end == length:
            break
        start = max(0, end - overlap)

    return chunks

