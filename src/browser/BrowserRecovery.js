class BrowserRecovery {
    /**
     * @param {Object} deps
     * @param {Object} deps.browserManager
     * @param {Object} deps.logger
     */
    constructor({ browserManager, logger }) {
        this.browserManager = browserManager;
        this.logger = logger;
    }

    /**
     * @returns {Promise<boolean>}
     */
    async recover() {
        this.logger.info({ event: 'BROWSER_RECOVERY_START' });

        try {
            // Attempt: Recreate context, attach profile, reopen Claude
            await this.browserManager.restart('browser_crash_recovery');
            
            const page = await this.browserManager.getPage();
            await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded' }).catch(() => {});
            
            // Validate it's alive
            if (await this.browserManager.isHealthy()) {
                this.logger.info({ event: 'BROWSER_RECOVERY_SUCCESS' });
                return true;
            }

            this.logger.error({ event: 'BROWSER_RECOVERY_FAILED' });
            return false;
        } catch (error) {
            this.logger.error({ event: 'BROWSER_RECOVERY_ERROR', error: error.message });
            return false;
        }
    }
}

module.exports = { BrowserRecovery };