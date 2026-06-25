class ClaudeHealthCheck {
    /**
     * @param {Object} deps
     * @param {Object} deps.browserManager
     * @param {Object} deps.sessionDetector
     * @param {Object} deps.logger
     */
    constructor({ browserManager, sessionDetector, logger }) {
        this.browserManager = browserManager;
        this.sessionDetector = sessionDetector;
        this.logger = logger;
    }

    /**
     * @returns {Promise<{issue: string, severity: string}|null>}
     */
    async execute() {
        try {
            // 1. Check basic browser connectivity
            const isBrowserAlive = await this.browserManager.isHealthy();
            if (!isBrowserAlive) {
                return { issue: 'BROWSER_CRASH', severity: 'CRITICAL' };
            }

            const page = await this.browserManager.getPage();
            if (!page || typeof page.isClosed === 'function' && page.isClosed()) {
                return { issue: 'BROWSER_CRASH', severity: 'CRITICAL' };
            }

            // 2. Network connectivity to Claude
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const fetchPromise = globalThis.fetch ? globalThis.fetch('https://claude.ai', { signal: controller.signal }) : Promise.resolve({ok: true});
                
                const res = await fetchPromise;
                clearTimeout(timeoutId);
                
                if (res && !res.ok && res.status >= 500) {
                     return { issue: 'NETWORK', severity: 'MEDIUM' };
                }
            } catch (networkError) {
                return { issue: 'NETWORK', severity: 'MEDIUM' };
            }

            // 3. Delegate deep DOM checks to SessionDetector
            const domIssue = await this.sessionDetector.detect(page);
            if (domIssue) {
                return domIssue;
            }

            return null; // Healthy
        } catch (error) {
            this.logger.error({ event: 'CLAUDE_HEALTH_CHECK_ERROR', error: error.message });
            return { issue: 'BROWSER_CRASH', severity: 'CRITICAL' };
        }
    }
}

module.exports = { ClaudeHealthCheck };