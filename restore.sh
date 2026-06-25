#!/bin/bash
set -e

BACKUP_PATH=$1

if [ -z "$BACKUP_PATH" ]; then
    echo "Usage: ./restore.sh <path_to_backup_folder>"
    exit 1
fi

if [ ! -d "$BACKUP_PATH" ]; then
    echo "Error: Backup directory not found at $BACKUP_PATH"
    exit 1
fi

echo "=== System Restore Initiated ($BACKUP_PATH) ==="

# 1. Stop Application
echo "Stopping application..."
pm2 stop claude-worker || true

# 2. Restore DB
if [ -f "$BACKUP_PATH/jobs.sqlite.bak" ]; then
    echo "Restoring database..."
    cp "$BACKUP_PATH/jobs.sqlite.bak" jobs.sqlite
fi

# 3. Restore Profile
if [ -f "$BACKUP_PATH/profile.tar.gz" ]; then
    echo "Restoring browser profile..."
    rm -rf chrome-profile
    tar -xzf "$BACKUP_PATH/profile.tar.gz"
fi

# 4. Restore .env (if missing)
if [ ! -f .env ] && [ -f "$BACKUP_PATH/.env.bak" ]; then
    echo "Restoring .env configuration..."
    cp "$BACKUP_PATH/.env.bak" .env
fi

echo "=== Restore Complete ==="
echo "You may need to perform manual login if hardware has changed."
echo "Run ./start.sh to resume."
