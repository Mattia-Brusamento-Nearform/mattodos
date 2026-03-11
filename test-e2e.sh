#!/bin/bash
set -e

echo "Starting docker-compose services..."
docker-compose up -d

echo "Waiting for services to be healthy..."
sleep 5

# Check if backend is responding
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "Backend is healthy"
    break
  fi
  echo "Waiting for backend... (attempt $((attempt+1))/$max_attempts)"
  sleep 2
  attempt=$((attempt+1))
done

if [ $attempt -eq $max_attempts ]; then
  echo "Backend failed to start!"
  docker-compose down
  exit 1
fi

echo "Running Playwright tests..."
cd frontend && npx playwright test e2e/ --reporter=html

test_result=$?

echo "Stopping docker-compose services..."
docker-compose down

exit $test_result
