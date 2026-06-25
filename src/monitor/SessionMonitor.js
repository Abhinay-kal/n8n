class SessionMonitor {
    /**
     * @param {Object} deps
     * @param {import('./StateMachine').StateMachine} deps.stateMachine
     * @param {import('../session/ClaudeHealthCheck').ClaudeHealthCheck} deps.claudeHealthCheck
     * @param {import('./RecoveryManager').RecoveryManager} deps.recoveryManager
     * @param {import('../services/QueueService').QueueService} deps.queueService
     * @param {import('../services/MetricsService').MetricsService} deps.metricsService
     * @param {Object} deps.logger
     */
    constructor({ stateMachine, claudeHealthCheck, recoveryManager, queueService, metricsService, logger }) {
        this.stateMachine = stateMachine;
        this.claudeHealthCheck = claudeHealthCheck;
        this.recoveryManager = recoveryManager;
        this.queueService = queueService;
        this.metricsService = metricsService;
        this.logger = logger;

        this.timer = null;
        this.isChecking = false;
        this.activeIssues = [];
        this.lastCheck = null;
    }

    start() {
        if (this.timer) return;
        this.logger.info({ event: 'SESSION_MONITOR_START' });

        this.timer = setInterval(async () => {
            await this.runHealthCheck();
        }, 60000); // 60 seconds

        // Initial check immediately
        this.runHealthCheck().catch(err => {
            this.logger.error({ event: 'INITIAL_HEALTH_CHECK_FAILED', error: err.message });
        });
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async runHealthCheck() {
        if (this.isChecking) return;
        this.isChecking = true;

        try {
            this.lastCheck = new Date().toISOString();

            // Only check if we are not already BROKEN (which requires manual intervention)
            if (this.stateMachine.getState() === 'BROKEN') {
                return; 
            }

            // 1. & 2. & 3. Check Browser -> Claude Page -> Session
            const issue = await this.claudeHealthCheck.execute();
            
            // 4. Check Queue (ensure it's not jammed if we are healthy)
            const queueJammed = !issue && this.queueService.size > 0 && !this.queueService.active && !this.queueService.paused;

            if (!issue && !queueJammed) {
                // Healthy
                this.activeIssues = [];
                this.stateMachine.transition('HEALTHY');
                this.queueService.resume(); // Ensure queue is resumed when healthy
            } else {
                // Determine problem
                const currentIssue = issue || { issue: 'QUEUE_JAMMED', severity: 'MEDIUM' };
                this.activeIssues = [currentIssue.issue];
                
                this.logger.warn({ event: 'HEALTH_ISSUE_DETECTED', issue: currentIssue });
                
                // 5. & 6. Update State and Trigger Recovery
                // Recovery manager handles DEGRADED state transition and pausing queue
                await this.recoveryManager.executeRecovery(currentIssue);
            }
        } catch (error) {
            this.logger.error({ event: 'HEALTH_CHECK_LOOP_ERROR', error: error.message });
        } finally {
            this.isChecking = false;
        }
    }

    getStatus() {
        return {
            state: this.stateMachine.getState(),
            lastCheck: this.lastCheck,
            lastRecovery: this.recoveryManager.lastRecovery,
            activeIssues: this.activeIssues,
            recoveryAttempts: this.recoveryManager.recoveryAttempts
        };
    }
}

module.exports = { SessionMonitor };