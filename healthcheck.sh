#!/bin/bash
set -e

# Load port from .env or default
PORT=$(grep PORT .env | cut -d '=' -f2 || echo 3000)
KEY=$(grep API_KEYS .env | cut -d '=' -f2 | cut -d ',' -f1 || echo "")

echo "Performing health check on port $PORT..."

RESPONSE=$(curl -s -H "x-api-key: $KEY" "http://localhost:$PORT/health")

if echo "$RESPONSE" | grep -q '"ready":true'; then
    echo "✓ System is READY and Healthy"
    exit 0
else
    echo "✗ System Health Check Failed or Not Ready"
    echo "Response: $RESPONSE"
    exit 1
fi
