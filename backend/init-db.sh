#!/bin/bash

# Database initialization script for Docker
# This script will run migrations and set up the database schema

set -e

echo "🔄 Starting database initialization..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-traveler}" > /dev/null 2>&1; then
    echo "✓ PostgreSQL is ready!"
    break
  fi
  echo "Attempt $i: Waiting for database..."
  sleep 2
done

# Run migrations
echo "📦 Running database migrations..."
npm run migrate

echo "✓ Database initialization complete!"
echo ""
echo "📊 Database schema created with tables:"
echo "  - locations (travel locations)"
echo "  - routes (travel routes/paths)"
echo "  - notes (location notes)"
echo "  - journeys (travel journeys)"
echo ""
echo "🎉 Ready to accept API requests!"
