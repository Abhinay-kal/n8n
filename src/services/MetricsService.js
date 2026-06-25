class MetricsService {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            healthy_minutes: 0,
            degraded_minutes: 0,
            broken_minutes: 0,
            recoveries: 0,
            failed_recoveries: 0,
            browser_restarts: 0,
            page_restarts: 0,
            rate_limits: 0,
            captchas: 0,
            session_expirations: 0,
            queue_failures: 0,
            startup_failures: 0,
            jobs_completed: 0,
            jobs_failed: 0,
            total_runtime_ms: 0
        };
        
        this.minuteTimer = null;
        this.lastState = 'STARTING';
        this.lastUsage = process.cpuUsage();
        this.lastTime = process.hrtime();
    }

    start() {
        if (this.minuteTimer) return;

        // Timer to update minute-based metrics
        this.minuteTimer = setInterval(() => {
            const state = this.lastState;
            if (state === 'HEALTHY' || state === 'READY' || state === 'BUSY') {
                this.metrics.healthy_minutes++;
            } else if (state === 'DEGRADED' || state === 'RECOVERING') {
                this.metrics.degraded_minutes++;
            } else if (state === 'BROKEN') {
                this.metrics.broken_minutes++;
            }
        }, 60000);
        this.minuteTimer.unref?.();
    }

    shutdown() {
        if (this.minuteTimer) {
            clearInterval(this.minuteTimer);
            this.minuteTimer = null;
        }
    }

    updateState(state) {
        this.lastState = state;
    }

    recordIncident(type) {
        switch(type) {
            case 'RATE_LIMIT': this.metrics.rate_limits++; break;
            case 'CAPTCHA': this.metrics.captchas++; break;
            case 'BROWSER_CRASH': this.metrics.browser_restarts++; break;
            case 'PAGE_CRASH': this.metrics.page_restarts++; break;
            case 'SESSION_EXPIRED': this.metrics.session_expirations++; break;
            case 'QUEUE_FAILURE': this.metrics.queue_failures++; break;
            case 'STARTUP_FAILURE': this.metrics.startup_failures++; break;
        }
    }

    recordJobCompletion(runtimeMs) {
        this.metrics.jobs_completed++;
        this.metrics.total_runtime_ms += runtimeMs;
    }

    recordJobFailure() {
        this.metrics.jobs_failed++;
    }

    recordRecovery(success) {
        if (success) {
            this.metrics.recoveries++;
        } else {
            this.metrics.failed_recoveries++;
        }
    }

    getSnapshot() {
        const now = Date.now();
        const uptimeMs = now - this.metrics.startTime;
        const uptimeHours = uptimeMs / (1000 * 60 * 60);
        
        // System Resources
        const mem = process.memoryUsage();
        const memoryMB = Math.round(mem.rss / 1024 / 1024);
        
        // Basic CPU estimation
        const currentUsage = process.cpuUsage();
        const currentTime = process.hrtime();
        const timeDiff = (currentTime[0] - this.lastTime[0]) * 1e9 + (currentTime[1] - this.lastTime[1]);
        const userDiff = currentUsage.user - this.lastUsage.user;
        const sysDiff = currentUsage.system - this.lastUsage.system;
        const cpuPercent = timeDiff > 0 ? (((userDiff + sysDiff) * 1000) / timeDiff * 100).toFixed(1) : 0;
        
        this.lastUsage = currentUsage;
        this.lastTime = currentTime;

        const avgRuntime = this.metrics.jobs_completed > 0 
            ? Math.round(this.metrics.total_runtime_ms / this.metrics.jobs_completed) 
            : 0;

        return {
            uptimeMs,
            uptimeHours: Number(uptimeHours.toFixed(2)),
            resources: {
                memoryMB,
                cpuPercent: Number(cpuPercent)
            },
            ...this.metrics,
            avg_runtime_ms: avgRuntime,
            lastState: this.lastState
        };
    }

    stop() {
        if (this.minuteTimer) {
            clearInterval(this.minuteTimer);
        }
    }
}

module.exports = { MetricsService };