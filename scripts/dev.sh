#!/usr/bin/env bash
set -euo pipefail

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
  # shellcheck source=/dev/null
  source .venv/bin/activate
fi

exec uvicorn app.main:app --reload

