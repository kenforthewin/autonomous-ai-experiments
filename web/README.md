# Personal Knowledge Base Web UI

This Next.js 16 application provides a minimal interface for managing documents, asking questions, and browsing wiki pages generated from your knowledge base.

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running locally on http://localhost:8000

## Setup

```bash
npm install
cp .env.local.example .env.local
# update values in .env.local if your backend runs elsewhere
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Production Build

```bash
npm run build
npm start
```

## Linting & Types

```bash
npm run lint
npm run type-check
```

Environment variables:

- `BACKEND_URL`: Server-side requests to the FastAPI backend (default http://localhost:8000)
- `NEXT_PUBLIC_BACKEND_URL`: Exposed to the browser for client-side fetches (default http://localhost:8000)

