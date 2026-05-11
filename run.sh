#!/usr/bin/env bash
set -euo pipefail
# run.sh - bootstrap and run the production docker-compose stack locally
# Usage: ./run.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env}"
MIGRATE_CMD="npm run migrate"

cd "$ROOT_DIR"

echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "docker is required. Install Docker and try again." >&2; exit 1; }
if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required (use 'docker compose')" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ] && [ -f .env.example ]; then
  echo "Creating $ENV_FILE from .env.example"
  cp .env.example "$ENV_FILE"
fi

echo "Building images (this may take a while)..."
docker compose -f "$COMPOSE_FILE" build --pull

echo "Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Running database migrations inside backend container (with retries)..."
for i in $(seq 1 20); do
  if docker compose -f "$COMPOSE_FILE" exec -T backend $MIGRATE_CMD; then
    echo "Migrations completed."
    break
  else
    echo "Migration attempt $i failed; retrying in 3s..."
    sleep 3
  fi
  if [ "$i" -eq 20 ]; then
    echo "Migrations failed after multiple attempts." >&2
    exit 1
  fi
done

wait_for() {
  local url="$1"; local name="$2"; local attempts=60
  for n in $(seq 1 $attempts); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$name is healthy"
      return 0
    fi
    echo "Waiting for $name... ($n/$attempts)"
    sleep 2
  done
  echo "$name did not become healthy in time" >&2
  return 1
}

echo "Checking service health (this checks host ports)"
wait_for "http://localhost:5000/health" "backend" || echo "Backend health check failed or timed out"
wait_for "http://localhost:3000/" "frontend" || echo "Frontend health check failed or timed out"

echo "Done. Frontend: http://localhost:3000  Backend: http://localhost:5000"
echo "To stop the stack: docker compose -f $COMPOSE_FILE down"
