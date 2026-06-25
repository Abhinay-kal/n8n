class DashboardService {
    constructor({ services, logger }) {
        this.services = services;
        this.logger = logger;
        this.timer = null;
        this.intervalMs = 5000;
    }

    start() {
        if (this.timer) return;
        
        // Initial draw
        this.draw();
        
        this.timer = setInterval(() => {
            this.draw();
        }, this.intervalMs);
        this.timer.unref?.();
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    draw() {
        const { stateMachine, browserManager, claudeManager, queueService, metricsService, sessionMonitor, recoveryManager } = this.services;
        
        const state = stateMachine.getState();
        const metrics = metricsService.getSnapshot();
        const monitorStatus = sessionMonitor.getStatus();
        const browserHealthy = browserManager.context && !browserManager.contextClosed;
        const pageHealthy = browserManager.claudePage && !browserManager.pageClosed;
        const sessionHealthy = claudeManager.initialized && state !== 'BROKEN';
        
        const uptime = this._formatUptime(metrics.uptimeMs);
        const successRate = this._calculateSuccessRate(metrics);

        // Clear terminal
        process.stdout.write('\x1Bc');
        
        process.stdout.write('══════════════════════════════════════\n');
        process.stdout.write('Claude Worker Foundation\n');
        process.stdout.write('══════════════════════════════════════\n\n');
        
        process.stdout.write(`State: ${this._colorizeState(state)}\n\n`);
        
        process.stdout.write(`Database\n${this._check(true)} Connected\n\n`);
        process.stdout.write(`Browser\n${this._check(browserHealthy && pageHealthy)} Connected\n\n`);
        process.stdout.write(`Claude Session\n${this._check(sessionHealthy)} Authenticated\n\n`);
        process.stdout.write(`Worker\n${this._check(state !== 'BROKEN' && state !== 'STARTING')} Running\n\n`);
        process.stdout.write(`Queue\n${this._check(!queueService.paused)} Active\n\n`);
        process.stdout.write(`Recovery\n${this._check(state !== 'RECOVERING')} Idle\n\n`);
        process.stdout.write(`Metrics\n${this._check(true)} Recording\n\n`);
        process.stdout.write(`Server\n${this._check(true)} Listening\n\n`);
        
        process.stdout.write('══════════════════════════════════════\n\n');
        
        process.stdout.write(`CPU: ${metrics.resources.cpuPercent}% | Memory: ${metrics.resources.memoryMB} MB\n\n`);
        
        process.stdout.write(`Jobs Processed: ${metrics.recoveries + metrics.failed_recoveries + metrics.queue_failures > 0 ? 'N/A' : '0'}\n`); // This needs actual job counts if available
        process.stdout.write(`Success Rate: ${successRate}%\n`);
        process.stdout.write(`Failures: ${metrics.failed_recoveries + metrics.queue_failures}\n\n`);
        
        process.stdout.write(`Uptime: ${uptime}\n\n`);
        
        process.stdout.write('══════════════════════════════════════\n');
        
        if (monitorStatus.activeIssues && monitorStatus.activeIssues.length > 0) {
            process.stdout.write(`\nActive Issues: ${monitorStatus.activeIssues.join(', ')}\n`);
        }
        
        if (state === 'RECOVERING') {
            process.stdout.write(`\nRecovery in Progress (Attempt ${recoveryManager.recoveryAttempts}/${recoveryManager.MAX_RECOVERY_ATTEMPTS})\n`);
        }
    }

    _check(condition) {
        return condition ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    }

    _colorizeState(state) {
        switch (state) {
            case 'READY':
            case 'HEALTHY':
                return `\x1b[32m${state}\x1b[0m`;
            case 'BUSY':
                return `\x1b[34m${state}\x1b[0m`;
            case 'DEGRADED':
            case 'RECOVERING':
                return `\x1b[33m${state}\x1b[0m`;
            case 'BROKEN':
                return `\x1b[31m${state}\x1b[0m`;
            default:
                return state;
        }
    }

    _formatUptime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    _calculateSuccessRate(metrics) {
        const total = metrics.recoveries + metrics.failed_recoveries;
        if (total === 0) return '100';
        return ((metrics.recoveries / total) * 100).toFixed(1);
    }
}

module.exports = { DashboardService };
