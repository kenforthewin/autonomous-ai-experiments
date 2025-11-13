from __future__ import annotations

from app.rag.chunking import chunk_text


def test_chunk_text_with_short_text_returns_single_chunk() -> None:
    text = "Hello world!"

    chunks = chunk_text(text, target_tokens=100, overlap=10)

    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunk_text_with_overlap() -> None:
    text = " ".join(str(i) for i in range(200))

    chunks = chunk_text(text, target_tokens=30, overlap=10)

    assert len(chunks) > 1
    # Ensure overlap effect: last tokens of previous chunk appear in next chunk
    assert chunks[0].split()[-5:] == chunks[1].split()[:5]

