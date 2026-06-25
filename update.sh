#!/bin/bash
set -e

echo "=== System Update Sequence ==="

# 1. Pull latest code
echo "Pulling latest changes..."
git pull

# 2. Install dependencies
echo "Updating dependencies..."
npm ci --production

# 3. Reload PM2 (Zero-downtime attempt, though state logic makes it 1-at-a-time)
echo "Reloading application..."
pm2 reload claude-worker

echo "Update complete. Verifying health..."
sleep 5
./healthcheck.sh
