#!/bin/bash
echo "Restarting Claude Worker..."
pm2 restart claude-worker
echo "Restart triggered."
