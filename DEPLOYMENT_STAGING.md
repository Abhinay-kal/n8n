# Staging Deployment Design

## Infrastructure
* **OS**: Ubuntu 22.04 LTS (Jammy Jellyfish)
* **Node.js**: v20.x LTS
* **Process Manager**: PM2

## Filesystem Layout
```text
/opt/claude-worker/           # Application Root
  ├── src/                    # Source code
  ├── chrome-profile/         # Persistent Chromium Profile (Session Data)
  ├── temp-chrome-data/       # Volatile Profile Fallback
  ├── jobs.sqlite             # Primary DB (Persistent)
  ├── jobs.sqlite-wal         # SQLite WAL
  ├── jobs.sqlite-shm         # SQLite SHM
  ├── logs/                   # Application log dumps and screenshots
  ├── scripts/                # Obsolete/Legacy/Debug scripts
  ├── archive/                # Archived artifacts
  ├── package.json
  └── .env                    # Production configuration
```

## PM2 Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'claude-worker',
    script: 'src/index.js',
    instances: 1, // MUST be 1. Browser profiles cannot be shared concurrently.
    autorestart: true,
    watch: false,
    max_memory_restart: '2G', // Prevent runaway memory leaks
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```