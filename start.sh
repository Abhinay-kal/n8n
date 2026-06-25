#!/bin/bash
echo "Starting Claude Worker via PM2..."
pm2 start ecosystem.config.js
pm2 save
echo "System active. View status with: pm2 status"
