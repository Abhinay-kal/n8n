#!/bin/bash
echo "Stopping Claude Worker..."
pm2 stop claude-worker
echo "System stopped."
