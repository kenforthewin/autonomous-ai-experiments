from __future__ import annotations

from pathlib import Path

import docx
from pypdf import PdfReader

from app.services.utils import normalize_text


def parse_text(title: str, content: str) -> str:
    return normalize_text(content)


def parse_file(path: str | Path) -> str:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(path)

    suffix = path.suffix.lower()
    if suffix in {".txt", ".md"}:
        text = path.read_text(encoding="utf-8")
    elif suffix == ".pdf":
        reader = PdfReader(path)
        text_parts = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(text_parts)
    elif suffix == ".docx":
        document = docx.Document(path)
        text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    return normalize_text(text)

