# Final Production Launch Checklist

**Execution Role**: Operations Engineer / SRE
**Date**: _________

## 1. Server Preparation
- [ ] OS is updated (`apt update && apt upgrade -y`)
- [ ] Node.js v20+ is installed.
- [ ] PM2 is installed globally (`npm install -g pm2`).
- [ ] Playwright dependencies are installed (`npx playwright install-deps`).

## 2. Environment Configuration
- [ ] `.env` file is created and secured (`chmod 600 .env`).
- [ ] `PORT` is set to the desired application port.
- [ ] `API_KEYS` is populated with strong, comma-separated keys.
- [ ] `CLAUDE_PROFILE_PATH` is set to the absolute path of the designated profile directory.

## 3. Proxy & Security
- [ ] Nginx/HAProxy is configured to forward requests to the application port.
- [ ] Reverse proxy is passing the `X-Forwarded-For` header.
- [ ] Application `app.set('trust proxy', 1)` has been verified.
- [ ] Edge firewall only permits inbound traffic on 80/443 (blocking direct access to Node.js port).

## 4. Claude Authentication (Manual Initialization)
- [ ] Set `CLAUDE_HEADLESS=false` temporarily in `.env` (or use local machine).
- [ ] Launch application or browser manually.
- [ ] Log in to Claude.ai and solve any initial CAPTCHAs.
- [ ] Close the browser gracefully to ensure `Cookies` and `Local State` are encrypted and saved.
- [ ] Set `CLAUDE_HEADLESS=true` in `.env`.

## 5. Startup & Readiness
- [ ] Start the application via PM2: `pm2 start ecosystem.config.js`.
- [ ] Tail logs: `pm2 logs claude-worker`.
- [ ] Verify Phase 1-4 execute successfully.
- [ ] Verify the log outputs `READY TO ACCEPT TRAFFIC`.

## 6. Monitoring & Verification
- [ ] Run `curl -H "x-api-key: YOUR_KEY" http://localhost:PORT/health`. Confirm `{"status":"healthy","ready":true}`.
- [ ] Run `curl -H "x-api-key: YOUR_KEY" http://localhost:PORT/status`. Verify `uptime`, `resources`, and `queue` metrics populate correctly.

## 7. Backups
- [ ] Verify automated backup script (cron) is configured for `jobs.sqlite`.
- [ ] Verify automated backup script (cron) is configured for the `chrome-profile` directory (excluding Cache).

---
**Sign-off:**
System is empirically validated and authorized for live traffic routing.
[Signature / Name]
