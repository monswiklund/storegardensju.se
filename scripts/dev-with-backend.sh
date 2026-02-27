#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_SCRIPT="$ROOT_DIR/../storegardensju-backend/scripts/dev_docker.sh"

if [[ ! -x "$BACKEND_SCRIPT" ]]; then
  echo "Missing backend script: $BACKEND_SCRIPT" >&2
  exit 1
fi

# Ensure backend dev container is up.
"$BACKEND_SCRIPT" up

# Stream backend logs in background while Vite runs in foreground.
"$BACKEND_SCRIPT" logs &
LOGS_PID=$!

cleanup() {
  kill "$LOGS_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

exec vite
