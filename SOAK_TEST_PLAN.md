# 14-Day Soak Test Plan

## Objective
Validate the long-running stability of the Claude Worker Foundation under realistic production loads and environmental constraints.

## Duration & Cadence
*   **Total Duration**: 14 Days
*   **Check-in Cadence**: 24h, 72h, 7 Days, 14 Days

## Instrumented Metrics (via `/status` and Terminal Dashboard)
*   **Uptime**: Continuous running time of the PM2 process.
*   **Memory Growth**: Tracked via `metrics.resources.memoryMB`.
*   **Queue Throughput**: Total successful rewrites vs. queue size.
*   **Incident Counters**: `browserRestarts`, `sessionExpirations`, `rateLimits`, `captchas`, `queueFailures`, `startupFailures`.
*   **Recovery Effectiveness**: Success rate of automated recoveries (`metrics.successRate`).

## Validation Thresholds & Pass Criteria

| Metric | Threshold | Pass/Fail Criteria |
| :--- | :--- | :--- |
| **Memory Growth** | < 1.5 GB | **PASS** if RSS memory stabilizes and does not hit PM2's 2G restart limit. |
| **Queue Success** | > 99% | **PASS** if job failures (`queueFailures`) account for less than 1% of total throughput. |
| **Recovery Success**| > 95% | **PASS** if the system successfully recovers from rate limits, network errors, or browser crashes without manual intervention. |
| **Unexpected Restarts** | < 3/week | **PASS** if the PM2 process does not crash unexpectedly (excluding intentional updates). |
| **Readiness Failures** | 0 | **PASS** if every PM2 restart successfully binds to port 3000. |

## Failure Injection Scenarios (To be executed on Day 1 & Day 7)

| Scenario | Injection Method | Expected Behavior | Recovery Action | Acceptable Recovery Time |
| :--- | :--- | :--- | :--- | :--- |
| **Browser Crash** | `kill -9 $(pgrep -f "playwright")` | Worker state transitions to `DEGRADED`. | `BrowserRecovery` recreates context and page. | < 60 seconds |
| **Network Loss** | Disable container/VM network for 30s | Prompts fail with `NETWORK_ERROR`. | `RecoveryManager` pauses queue, reloads page, resumes. | < 2 minutes |
| **Session Expiration**| Clear cookies manually in headed mode | `ClaudeHealthCheck` detects `SESSION_EXPIRED`. | Transitions to `DEGRADED`. Notifies operator via logs/dashboard. | Manual intervention required. Queue remains paused. |
| **Database Lock** | Manually lock SQLite DB | Job fetch/creation fails. | Handled gracefully via `try/catch`, logged as `QUEUE_FAILURE`. | Immediate / Next Polling tick |
| **Profile Corruption**| `echo "corrupt" > chrome-profile/Local\ State` | PM2 restart fails Phase 3 Readiness. | App exits and fails to bind port 3000. | Manual restore required. |
