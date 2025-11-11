# Personal RAG Notetaking Backend

This is the FastAPI backend scaffold for the Personal RAG Notetaking App. It provides configuration, database models, parsing utilities, and RAG pipeline primitives.

## Requirements

- Python 3.12+

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Running the Server

```bash
uvicorn app.main:app --reload
```

The app will listen on `http://localhost:8000` by default. A health check is available at `/health`.

## Testing

```bash
pytest
```

