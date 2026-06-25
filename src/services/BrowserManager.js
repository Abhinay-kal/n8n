const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const { spawnSync } = require('child_process');
const { WORKER_STATES } = require('../models/WorkerState');
const { BrowserError, ProfileLockError } = require('../errors/ClaudeErrors');

class BrowserManager {
    constructor({ config, logger, workerState }) {
        this.config = config;
        this.logger = logger;
        this.workerState = workerState;

        this.context = null;
        this.claudePage = null;
        this.contextClosed = true;
        this.pageClosed = true;
        this.initializingPromise = null;
        this.restartingPromise = null;
        this.browserPid = null;
        this._isClosing = false;

        this._setupProcessHandlers();
    }

    _setupProcessHandlers() {
        // Ensure we only attach these once globally to prevent MaxListenersExceededWarning
        // if BrowserManager is somehow instantiated multiple times.
        if (BrowserManager._handlersAttached) return;
        BrowserManager._handlersAttached = true;

        // Keep track of all created instances to clean them up globally
        if (!BrowserManager._instances) {
            BrowserManager._instances = new Set();
        }
        BrowserManager._instances.add(this);

        const cleanupAll = () => {
            for (const instance of BrowserManager._instances) {
                if (instance.browserPid) {
                    instance.logger.warn({ event: 'EMERGENCY_PROCESS_CLEANUP', pid: instance.browserPid });
                    instance._forceKillBrowser();
                }
            }
        };

        process.on('exit', cleanupAll);
        
        // For signals and unhandled errors, we must kill then exit to not hang the process.
        process.on('SIGINT', () => { 
            cleanupAll(); 
            process.exit(0); 
        });
        process.on('SIGTERM', () => { 
            cleanupAll(); 
            process.exit(0); 
        });
        process.on('uncaughtException', (err) => {
            this.logger.error({ event: 'UNCAUGHT_EXCEPTION', error: err.message, stack: err.stack });
            cleanupAll();
            process.exit(1);
        });
        process.on('unhandledRejection', (reason) => {
            this.logger.error({ event: 'UNHANDLED_REJECTION', reason });
            cleanupAll();
            process.exit(1);
        });
    }

    _forceKillBrowser() {
        if (!this.browserPid) return;
        const pid = this.browserPid;
        this.browserPid = null; // Prevent repeated kills
        
        this.logger.info({ event: 'FORCE_KILL_START', pid });

        try {
            // First, attempt to kill the entire process group if running on UNIX-like OS.
            // A negative PID targets the process group.
            try {
                process.kill(-pid, 'SIGKILL');
                this.logger.info({ event: 'BROWSER_PROCESS_GROUP_KILLED', pid });
            } catch (pgError) {
                // Fallback to killing just the specific process if group kill fails
                process.kill(pid, 'SIGKILL');
                this.logger.info({ event: 'BROWSER_PROCESS_KILLED', pid });
            }
        } catch (error) {
            // ESRCH means the process was already dead, which is fine
            if (error.code !== 'ESRCH') {
                this.logger.error({ event: 'FORCE_KILL_FAILED', pid, error: error.message });
            } else {
                this.logger.info({ event: 'BROWSER_ALREADY_DEAD', pid });
            }
        }
        
        // Final fallback: Use aggressive system commands to catch child process stragglers
        // matching the specific Chrome profile path, just in case they detached.
        try {
            if (this.config.profilePath) {
                spawnSync('pkill', ['-f', this.config.profilePath]);
                this.logger.info({ event: 'PKILL_FALLBACK_EXECUTED', profile: this.config.profilePath });
            }
        } catch (e) {
            // Ignore pkill errors (e.g. if pkill is not installed or no matches found)
        }
    }

    async initialize() {
        if (await this.isHealthy()) {
            return this;
        }

        if (this.restartingPromise !== null) {
            return this.restartingPromise;
        }

        if (this.initializingPromise !== null) {
            return this.initializingPromise;
        }

        this.initializingPromise = this._initializeInternal();

        try {
            return await this.initializingPromise;
        } finally {
            this.initializingPromise = null;
        }
    }

    async _initializeInternal() {
        const browser = this.context?.browser?.();
        const contextAlive = Boolean(this.context) && !this.contextClosed && (!browser || typeof browser.isConnected !== 'function' || browser.isConnected());
        
        if (contextAlive) {
            this.logger.info({ event: 'PAGE_RECOVERY_START' });
            if (!this.claudePage || this.claudePage.isClosed?.() || this.pageClosed) {
                await this._attachSinglePage();
            }

            this.workerState.setState(WORKER_STATES.READY, 'browser page recovered');
            return this;
        }

        this.logger.info({ event: 'STARTUP', profilePath: this.config.profilePath, channel: this.config.browserChannel, headless: this.config.headless });
        this.workerState.setState(WORKER_STATES.STARTING, 'browser initialization');

        try {
            await this._launchContext();
            await this._attachSinglePage();

            this.workerState.setState(WORKER_STATES.READY, 'browser initialized');
            return this;
        } catch (error) {
            this.logger.error({ event: 'STARTUP_FAILED', error: error.message });
            throw error;
        }
    }

    async _launchContext() {
        const backoffScheduleMs = [1000, 2000, 4000];
        let lastError = null;

        for (let attempt = 1; attempt <= backoffScheduleMs.length + 1; attempt += 1) {
            try {
                if (this.config.profilePath) {
                    const { execSync } = require('child_process');
                    execSync(`pkill -9 -f "${this.config.profilePath}"`);
                    const fs = require('fs');
                    const path = require('path');
                    const lockPath = path.join(this.config.profilePath, 'SingletonLock');
                    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
                    await this._sleep(1000);
                }
            } catch (e) {
                // Ignore errors
            }
            
            this.logger.info({ event: 'PRE_LAUNCH_CLEANUP', profile: this.config.profilePath, attempt });
            this.logger.info({ event: 'BROWSER_LAUNCH', profilePath: this.config.profilePath, channel: this.config.browserChannel, attempt });

            try {
                this.context = await chromium.launchPersistentContext(this.config.profilePath, {
                    headless: this.config.headless,
                    channel: this.config.browserChannel,
                    args: [
                        '--disable-blink-features=AutomationControlled',
                        '--disable-infobars',
                        '--window-size=1280,800',
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                    ],
                    ignoreDefaultArgs: ['--enable-automation']
                });

                this.contextClosed = false;

                this.context.on('close', () => {
                    this.contextClosed = true;
                    this.logger.warn({ event: 'CONTEXT_CLOSED' });
                });

                const origNewPage = this.context.newPage;
                this.context.newPage = async (...args) => {
                    this.logger.warn({ event: 'NEW_PAGE_CALLED', stack: new Error().stack });
                    return origNewPage.apply(this.context, args);
                };

                this.context.on('page', page => {
                    this.logger.warn({ event: 'PAGE_OPENED', url: page.url(), allPages: this.context.pages().map(p => p.url()) });
                });

                return;
            } catch (error) {
                lastError = error;
                const message = error?.message || '';
                const isProfileLock = message.includes('Opening in existing browser session') || 
                                    message.includes('profile is already in use') ||
                                    message.includes('SingletonLock') ||
                                    message.includes('Target page, context or browser has been closed'); // Catch the stealth plugin crash

                if (!isProfileLock) {
                    throw new BrowserError(`Failed to launch browser: ${message}`, { originalError: message });
                }

                if (attempt > backoffScheduleMs.length) {
                    throw new ProfileLockError(
                        `Browser Profile Lock Conflict:\nThe profile at ${this.config.profilePath} is already in use or repeatedly crashing.\n\nPlease close all other browser windows using this profile and try again.`,
                        { profilePath: this.config.profilePath }
                    );
                }

                this.logger.warn({ event: 'BROWSER_LAUNCH_RETRY', attempt, error: message });
                await this._sleep(backoffScheduleMs[attempt - 1]);
            }
        }

        throw lastError;
    }

    _markPage(page) {
        this.claudePage = page;
        this.pageClosed = false;

        page.on('close', () => {
            if (this.claudePage === page) {
                this.pageClosed = true;
                this.claudePage = null;
            }

            this.logger.warn({ event: 'PAGE_CLOSED' });
        });

        page.on('crash', () => {
            if (this.claudePage === page) {
                this.pageClosed = true;
                this.claudePage = null;
            }

            this.logger.error({ event: 'PAGE_CRASHED' });
        });
        
        const origPageClose = page.close;
        page.close = async (...args) => {
            this.logger.warn({ event: 'DEBUG_PAGE_CLOSE', stack: new Error().stack });
            return origPageClose.apply(page, args);
        };
    }

    _pages() {
        try {
            return this.context?.pages?.() || [];
        } catch (error) {
            this.logger.warn({ event: 'PAGES_ENUM_FAILED', error: error.message });
            return [];
        }
    }

    async _attachSinglePage() {
        const pages = this.context.pages();
        if (pages.length > 0) {
            // The stealth plugin fails to hook into the first automatically created page in persistent contexts.
            // We MUST close it and create a fresh one to guarantee all stealth scripts are injected!
            await pages[0].close().catch(() => {});
        }
        this.claudePage = await this.context.newPage();
        this.logger.info({ event: 'PAGE_CREATED' });

        this._markPage(this.claudePage);
        await this.claudePage.bringToFront().catch((error) => {
            this.logger.warn({ event: 'BRING_TO_FRONT_FAILED', error: error.message });
        });
        return this.claudePage;
    }

    async _closeDuplicatePages(keepPage) {
        const pages = this._pages();

        for (const candidate of pages) {
            if (candidate === keepPage) {
                continue;
            }

            if (candidate.isClosed?.()) {
                continue;
            }

            try {
                await candidate.close();
                this.logger.info({ event: 'DUPLICATE_PAGE_CLOSED', url: candidate.url() });
            } catch (error) {
                this.logger.warn({ event: 'DUPLICATE_PAGE_CLOSE_FAILED', error: error.message, url: candidate.url() });
            }
        }
    }

    async getPage() {
        if (!this.context || this.contextClosed) {
            throw new BrowserError('Browser not initialized. getPage() must only be called after successful bootstrap or restart.');
        }

        if (!this.claudePage || this.claudePage.isClosed?.() || this.pageClosed) {
            this.logger.warn({ event: 'PAGE_RECREATED' });
            this.claudePage = await this.context.newPage();
            this.pageClosed = false;
            this._markPage(this.claudePage);
        }

        return this.claudePage;
    }

    async isHealthy() {
        if (this.contextClosed || !this.context) return false;
        if (this.pageClosed || !this.claudePage) return false;

        try {
            const browser = this.context.browser();
            if (browser && !browser.isConnected()) return false;
            
            // Add timeout protection so a deadlocked browser doesn't hang the worker indefinitely
            const urlPromise = this.claudePage.url();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Browser page.url() health check timed out')), 5000)
            );
            
            await Promise.race([urlPromise, timeoutPromise]);
            return true;
        } catch (error) {
            this.logger.warn({ event: 'BROWSER_HEALTH_CHECK_FAILED', error: error.message });
            return false;
        }
    }

    async restart(reason = 'restart requested') {
        if (this.restartingPromise !== null) {
            return this.restartingPromise;
        }

        this.restartingPromise = this._restartInternal(reason);

        try {
            return await this.restartingPromise;
        } finally {
            this.restartingPromise = null;
        }
    }

    async _restartInternal(reason) {
        this.workerState.setState(WORKER_STATES.RECOVERING, reason);
        this.logger.warn({ event: 'RECOVERY_START', reason });

        await this.close();
        await this._initializeInternal();

        this.logger.info({ event: 'RECOVERY_COMPLETE', state: this.workerState.getState() });
        return this;
    }

    async close() {
        // Prevent multiple simultaneous close attempts (Idempotency)
        if (this._isClosing) return;
        this._isClosing = true;

        this.logger.info({ event: 'BROWSER_CLOSE_START' });

        const context = this.context;
        this.context = null;
        this.claudePage = null;
        this.contextClosed = true;
        this.pageClosed = true;

        try {
            if (context) {
                await context.close().catch(error => {
                    this.logger.warn({ event: 'CONTEXT_CLOSE_FAILED', error: error.message });
                });
            }
        } finally {
            // Guaranteed cleanup via kill command if graceful close misses processes
            this._forceKillBrowser();
            this._isClosing = false;
            this.logger.info({ event: 'BROWSER_CLOSE_COMPLETE' });
        }
    }

    async _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

module.exports = {
    BrowserManager
};
