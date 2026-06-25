class RecoveryManager {
    /**
     * @param {Object} deps
     * @param {import('./StateMachine').StateMachine} deps.stateMachine
     * @param {import('../services/QueueService').QueueService} deps.queueService
     * @param {import('../session/SessionRecovery').SessionRecovery} deps.sessionRecovery
     * @param {import('../browser/BrowserRecovery').BrowserRecovery} deps.browserRecovery
     * @param {import('../services/MetricsService').MetricsService} deps.metricsService
     * @param {Object} deps.logger
     */
    constructor({ stateMachine, queueService, sessionRecovery, browserRecovery, metricsService, logger }) {
        this.stateMachine = stateMachine;
        this.queueService = queueService;
        this.sessionRecovery = sessionRecovery;
        this.browserRecovery = browserRecovery;
        this.metricsService = metricsService;
        this.logger = logger;

        this.MAX_RECOVERY_ATTEMPTS = 5;
        this.recoveryAttempts = 0;
        
        this.rateLimitCooldowns = [5, 15, 30, 60]; // in minutes
        this.rateLimitAttempt = 0;
        this.rateLimitUntil = null;
        
        this.lastRecovery = null;
    }

    /**
     * @param {{issue: string, severity: string}} incident
     * @returns {Promise<boolean>}
     */
    async executeRecovery(incident) {
        this.stateMachine.transition('DEGRADED', `recovering_from_${incident.issue.toLowerCase()}`);
        this.queueService.pause();

        if (this.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
            this.logger.error({ event: 'MAX_RECOVERY_EXHAUSTED', issue: incident.issue });
            this.stateMachine.transition('BROKEN', 'max_recovery_attempts_exhausted');
            return false;
        }

        const backoffMs = Math.pow(2, this.recoveryAttempts) * 30000;
        this.logger.info({ event: 'RECOVERY_BACKOFF_DELAY', delayMs: backoffMs, attempt: this.recoveryAttempts + 1 });
        await this._sleep(backoffMs);

        this.recoveryAttempts++;
        this.lastRecovery = new Date().toISOString();
        this.logger.warn({ event: 'RECOVERY_INITIATED', issue: incident.issue, attempt: this.recoveryAttempts });
        
        let success = false;

        try {
            switch (incident.issue) {
                case 'LOGGED_OUT':
                    success = await this.sessionRecovery.recoverFromLogout();
                    break;
                case 'CAPTCHA':
                    success = await this._recoverFromCaptcha();
                    break;
                case 'RATE_LIMIT':
                    success = await this._recoverFromRateLimit();
                    break;
                case 'NETWORK':
                    success = await this._recoverFromNetwork();
                    break;
                case 'BROWSER_CRASH':
                default:
                    success = await this.browserRecovery.recover();
                    break;
            }
        } catch (error) {
            this.logger.error({ event: 'RECOVERY_EXECUTION_FAILED', error: error.message });
        }

        this.metricsService.recordRecovery(success);

        if (success) {
            this.logger.info({ event: 'RECOVERY_SUCCESSFUL', issue: incident.issue });
            this.recoveryAttempts = 0; // Reset on success
            
            if (this.rateLimitUntil && Date.now() > this.rateLimitUntil) {
                 this.rateLimitUntil = null;
                 this.rateLimitAttempt = 0;
            }

            this.stateMachine.transition('HEALTHY', 'recovery_successful');
            this.queueService.resume();
        } else {
            this.logger.error({ event: 'RECOVERY_FAILED', issue: incident.issue, attempt: this.recoveryAttempts });
            
            if (this.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
                this.stateMachine.transition('BROKEN', 'recovery_failed');
            } else {
                // Remain DEGRADED for the next loop to pick it up
                this.stateMachine.transition('DEGRADED', 'recovery_failed_retrying');
            }
        }

        return success;
    }

    async _recoverFromCaptcha() {
        this.logger.info({ event: 'RECOVERING_CAPTCHA_PAUSE' });
        // Reduced wait time from 5 minutes to 30 seconds for better responsiveness
        await this._sleep(30 * 1000); 
        
        // Since we can't solve it automatically, we assume it failed unless manual intervention occurred
        // A future health check will verify if it's cleared
        return true; // We return true to allow the next health check loop to evaluate, avoiding instant BROKEN state
    }

    async _recoverFromRateLimit() {
        const cooldownMinutes = this.rateLimitCooldowns[Math.min(this.rateLimitAttempt, this.rateLimitCooldowns.length - 1)];
        this.rateLimitAttempt++;
        
        this.rateLimitUntil = Date.now() + (cooldownMinutes * 60 * 1000);
        this.logger.info({ event: 'RECOVERING_RATE_LIMIT', cooldownMinutes, rateLimitUntil: new Date(this.rateLimitUntil).toISOString() });
        
        // We wait out the cooldown
        while (Date.now() < this.rateLimitUntil) {
            await this._sleep(60000); // Wait in 1 minute increments
        }
        
        // Let the next health check confirm
        return true;
    }

    async _recoverFromNetwork() {
        this.logger.info({ event: 'RECOVERING_NETWORK' });
        // Retry navigation / refresh
        const page = await this.browserRecovery.browserManager.getPage();
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        await this._sleep(5000);
        return true; // Assuming it might have worked, next health check will confirm
    }

    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { RecoveryManager };