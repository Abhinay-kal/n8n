class SessionDetector {
    /**
     * @param {Object} deps
     * @param {Object} deps.logger
     */
    constructor({ logger }) {
        this.logger = logger;
    }

    /**
     * @param {import('playwright').Page} page
     * @returns {Promise<{issue: string, severity: string}|null>}
     */
    async detect(page) {
        if (!page || typeof page.isClosed === 'function' && page.isClosed()) {
            return { issue: 'BROWSER_CRASH', severity: 'CRITICAL' };
        }

        try {
            const url = page.url() || '';
            const lowerUrl = url.toLowerCase();

            // 1. Logged Out Detection via URL
            const isLoginUrl = lowerUrl.includes('login') || lowerUrl.includes('signin');
            if (isLoginUrl) {
                return { issue: 'LOGGED_OUT', severity: 'HIGH' };
            }

            // 2. Captcha Detection via URL or Title
            // Avoid `page.evaluate` unless we are already suspicious, because repeated CDP evaluates trigger Turnstile
            const isChallengeUrl = lowerUrl.includes('challenge') || lowerUrl.includes('captcha');
            if (isChallengeUrl) {
                return { issue: 'CAPTCHA', severity: 'HIGH' };
            }

            // 3. Rate Limit Detection via URL
            const isErrorUrl = lowerUrl.includes('error');
            if (isErrorUrl) {
                return { issue: 'RATE_LIMITED', severity: 'HIGH' };
            }

            // 4. Overloaded Detection
            // We skip deep DOM polling to avoid anti-bot detection.
            
            return null; // Healthy
        } catch (error) {
            this.logger.warn({ event: 'DETECTION_FAILED', error: error.message });
            // If we can't even read the page, assume browser/tab crash
            return { issue: 'BROWSER_CRASH', severity: 'CRITICAL' };
        }
    }
}

module.exports = { SessionDetector };