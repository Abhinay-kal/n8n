class SessionRecovery {
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
    async recoverFromLogout() {
        this.logger.info({ event: 'SESSION_RECOVERY_LOGOUT_START' });

        try {
            const page = await this.browserManager.getPage();
            
            // 1. Refresh page
            await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
            await this._sleep(3000);
            
            if (await this._isLoggedIn(page)) {
                this.logger.info({ event: 'SESSION_RECOVERY_LOGOUT_SUCCESS', method: 'reload' });
                return true;
            }

            // 2. Reuse persistent profile (recreate context/page)
            this.logger.info({ event: 'SESSION_RECOVERY_LOGOUT_RESTARTING_CONTEXT' });
            await this.browserManager.restart('session_recovery');
            const newPage = await this.browserManager.getPage();
            await newPage.goto('https://claude.ai', { waitUntil: 'domcontentloaded' }).catch(() => {});
            await this._sleep(5000);

            if (await this._isLoggedIn(newPage)) {
                this.logger.info({ event: 'SESSION_RECOVERY_LOGOUT_SUCCESS', method: 'profile_reuse' });
                return true;
            }

            this.logger.error({ event: 'SESSION_RECOVERY_LOGOUT_FAILED', reason: 'manual_login_required' });
            return false;
        } catch (error) {
            this.logger.error({ event: 'SESSION_RECOVERY_LOGOUT_ERROR', error: error.message });
            return false;
        }
    }

    async _isLoggedIn(page) {
        try {
            const url = page.url();
            const text = await page.locator('body').textContent().catch(() => '');
            const lower = text.toLowerCase();
            const isLogin = url.includes('login') || lower.includes('sign in') || lower.includes('log in');
            return !isLogin;
        } catch {
            return false;
        }
    }

    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { SessionRecovery };