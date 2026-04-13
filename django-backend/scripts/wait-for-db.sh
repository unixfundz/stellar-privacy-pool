#!/bin/bash
# Wait for PostgreSQL to be ready before running commands

set -e

echo "Waiting for PostgreSQL..."

until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - continuing..."

exec "$@"