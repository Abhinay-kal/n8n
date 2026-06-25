# Deployment Commands Reference

This guide provides the exact commands for managing the Claude Worker Foundation in production.

## 1. Fresh Installation
Perform this on a new Ubuntu 22.04 instance.

```bash
chmod +x *.sh
./install.sh
# Edit .env and API_KEYS
nano .env
# Start the system
./start.sh
```

## 2. Update Deployment
Perform this to pull latest code and restart services.

```bash
./update.sh
```

## 3. Lifecycle Management

| Operation | Command |
| :--- | :--- |
| **Start** | `./start.sh` |
| **Stop** | `./stop.sh` |
| **Restart** | `./restart.sh` |
| **Health Check** | `./healthcheck.sh` |
| **View Logs** | `pm2 logs claude-worker` |
| **Real-time UI** | `pm2 monit` |

## 4. Backup & Restore

### Backup
Creates a timestamped snapshot of the DB and Browser Profile in `./backup/`.

```bash
./backup.sh
```

### Restore
Restores from a specific backup folder. **Warning: This overwrites current state.**

```bash
./restore.sh ./backup/YYYYMMDD-HHMMSS
```

## 5. Rollback
If an update fails, rollback to the previous stable state using a backup.

```bash
# 1. Stop current broken version
./stop.sh
# 2. Restore previous state
./restore.sh ./backup/PREVIOUS_STABLE
# 3. Start
./start.sh
```

## 6. Manual Headed Login (Recovery)
If session expires, use this to log back in.

```bash
# 1. Stop service
./stop.sh
# 2. Start in headed mode (requires X11/Desktop)
CLAUDE_HEADLESS=false node src/index.js
# 3. Log in via Browser, then Ctrl+C the terminal
# 4. Resume service
./start.sh
```
