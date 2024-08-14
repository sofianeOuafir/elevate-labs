#!/bin/bash

# Start PostgreSQL service in the background
docker-entrypoint.sh postgres &

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Wait indefinitely to keep the container running
tail -f /dev/null
