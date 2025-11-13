from __future__ import annotations

import json
import re
from collections import Counter
from typing import Iterable

from openai import OpenAI

from app.core.config import get_settings

_STOPWORDS = {
    "the",
    "and",
    "a",
    "an",
    "of",
    "to",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "this",
    "that",
    "it",
    "as",
    "or",
    "but",
    "we",
    "you",
    "your",
    "our",
    "their",
    "they",
    "he",
    "she",
    "them",
    "his",
    "her",
    "its",
    "can",
    "will",
    "would",
    "should",
    "could",
    "has",
    "have",
    "had",
    "not",
    "no",
    "yes",
    "about",
    "into",
    "over",
    "than",
    "more",
    "less",
}
_TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_\-']+")


def _should_use_offline() -> bool:
    settings = get_settings()
    return settings.offline_mode or not settings.openai_api_key


def _tokenize(text: str) -> Iterable[str]:
    for match in _TOKEN_PATTERN.finditer(text.lower()):
        token = match.group(0).strip("-'_")
        if not token or token in _STOPWORDS or token.isdigit():
            continue
        yield token


def classify_labels_offline(text: str, max_labels: int = 5) -> list[str]:
    counter: Counter[str] = Counter(_tokenize(text))
    if not counter:
        return []
    sorted_tokens = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    labels: list[str] = []
    for token, _ in sorted_tokens:
        if token not in labels:
            labels.append(token)
        if len(labels) >= max_labels:
            break
    return labels


def _get_client() -> OpenAI:
    settings = get_settings()
    if _should_use_offline():
        raise RuntimeError("OpenAI client requested while offline")
    return OpenAI(api_key=settings.openai_api_key)


def _parse_label_response(raw: str) -> list[str]:
    content = raw.strip()
    if not content:
        return []
    if content.startswith("```"):
        lines = [line for line in content.splitlines() if line.strip()]
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        if lines and lines[0].lower().startswith("json"):
            lines = lines[1:]
        content = "\n".join(lines)
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return []
    if isinstance(data, list):
        return [str(item).strip() for item in data if str(item).strip()]
    return []


def classify_labels(text: str, max_labels: int = 5) -> list[str]:
    if not text.strip():
        return []
    if _should_use_offline():
        return classify_labels_offline(text, max_labels=max_labels)

    try:
        client = _get_client()
        settings = get_settings()
        response = client.chat.completions.create(
            model=settings.rag_gen_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate short topic labels for personal notes. "
                        "Respond with a JSON array of 3 to 5 short labels, each 1-2 words."
                    ),
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
            temperature=0.2,
            max_tokens=128,
        )
        raw_text = response.choices[0].message.content or ""
        labels = _parse_label_response(raw_text)
        if not labels:
            raise ValueError("Empty labels from OpenAI response")
        return labels[:max_labels]
    except Exception:
        return classify_labels_offline(text, max_labels=max_labels)

