#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backup/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "=== System Backup Initiated ($TIMESTAMP) ==="

# 1. Backup Database
if [ -f jobs.sqlite ]; then
    echo "Backing up SQLite database..."
    cp jobs.sqlite "$BACKUP_DIR/jobs.sqlite.bak"
else
    echo "Warning: jobs.sqlite not found, skipping DB backup."
fi

# 2. Backup Browser Profile (excluding Cache)
if [ -d chrome-profile ]; then
    echo "Backing up Browser Profile (excluding Cache)..."
    tar -czf "$BACKUP_DIR/profile.tar.gz" --exclude='*Cache*' chrome-profile/
else
    echo "Warning: chrome-profile not found, skipping profile backup."
fi

# 3. Backup Configuration
if [ -f .env ]; then
    cp .env "$BACKUP_DIR/.env.bak"
fi

echo "Backup complete: $BACKUP_DIR"

# 4. Verify (check if files exist and are > 0 bytes)
if [ -s "$BACKUP_DIR/profile.tar.gz" ]; then
    echo "✓ Integrity Check Passed"
else
    echo "✗ Integrity Check Failed: Backup file is empty or missing"
    exit 1
fi
