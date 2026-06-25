/**
 * @typedef {import('../errors/ClaudeErrors').ClaudeError} ClaudeError
 */

const fs = require('node:fs');
const path = require('node:path');
const { 
    ValidationError, 
    RecoveryReport, 
    InvalidProjectContentError, 
    InvalidResponseQualityError, 
    createClaudeError, 
    normalizeError 
} = require('../errors/ClaudeErrors');
const { WORKER_STATES } = require('../models/WorkerState');

const SELECTORS = Object.freeze({
    input: [
        'fieldset div[contenteditable="true"]',
        'div[contenteditable="true"]',
        '[data-testid="chat-input"]',
        'textarea[placeholder*="Claude"]',
        'textarea',
        '[aria-label*="Write a message"]',
        '[data-testid*="chat"]'
    ],
    stopButton: [
        'button[aria-label*="Stop"]',
        'button:has-text("Stop")'
    ],
    sendButton: [
        'button[aria-label*="Send"]',
        'button[aria-label*="Submit"]',
        'button[type="submit"]',
        'button:has-text("Send")'
    ],
    assistantMessage: [
        '.font-claude-response .standard-markdown',
        '.font-claude-response',
        '[data-message-author-role="assistant"]',
        '.font-claude-response-body',
        '.font-claude-message',
        'main [class*="assistant"]',
        '[data-testid*="assistant"]'
    ],
    loginIndicators: [
        'Sign in',
        'Log in',
        'Please sign in',
        'Authentication required',
        'Sign in to continue'
    ],
    failureIndicators: [
        'Something went wrong',
        'Try again',
        'Message failed',
        'Unable to load',
        'Network error',
        'Rate limit',
        'Too many requests',
        'Overloaded'
    ]
});

class ClaudeManager {
    constructor({ browserManager, logger, config, workerState, queueLengthProvider = () => 0, sessionStatusProvider = () => 'unknown' }) {
        this.browserManager = browserManager;
        this.logger = logger;
        this.config = config;
        this.workerState = workerState;
        this.queueLengthProvider = queueLengthProvider;
        this.sessionStatusProvider = sessionStatusProvider;

        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retries: 0,
            totalResponseTimeMs: 0
        };

        this.lastDiagnostics = null;
        this.initialized = false;
        this.dumpedHtml = false;
    }

    async initialize() {
        if (this.initialized) {
            return this;
        }

        // Strict dependency check: BootstrapManager must have initialized browserManager
        if (!this.browserManager.context || this.browserManager.contextClosed) {
            throw new Error('Lifecycle Violation: BrowserManager must be initialized before ClaudeManager');
        }

        this.logger.info({ event: 'INIT_START' });
        this.workerState.setState(WORKER_STATES.STARTING, 'claude manager init');

        try {
            const page = await this.browserManager.getPage();
            
            // Navigate to Claude and wait for a stable state
            await this._ensureClaudeHome(page, true);
            
            // Critical: Fail-fast check during bootstrap
            const error = await this.detectErrors(page);
            if (error) {
                this.logger.error({ event: 'SESSION_VALIDATION_FAILED', type: error.type, message: error.message });
                throw error;
            }

            this.initialized = true;
            this.workerState.setState(WORKER_STATES.READY, 'claude manager ready');
            this.logger.info({ event: 'INIT_COMPLETE' });
            return this;
        } catch (error) {
            this.initialized = false;
            throw error;
        }
    }

    async ensureHealthy() {
        if (!this.initialized) {
            throw createClaudeError({
                type: 'BROWSER_ERROR',
                message: 'ClaudeManager not initialized. ensureHealthy() requires prior bootstrap.'
            });
        }

        try {
            const page = await this.browserManager.getPage();
            const error = await this.detectErrors(page);

            if (error) {
                if (error.type === 'SESSION_EXPIRED') {
                    const recovery = await this.recover(error);
                    return recovery.status === 'HEALTHY_AFTER_LOGIN';
                }

                if (error.type === 'BROWSER_DISCONNECTED') {
                    await this.recover(error);
                    return true;
                }

                if (error.type === 'UI_CHANGED') {
                    await this.recover(error);
                    return false;
                }

                if (error.retryable) {
                    await this.recover(error);
                    return true;
                }

                return false;
            }

            return await this.browserManager.isHealthy();
        } catch (error) {
            const wrapped = normalizeError(error);
            this.logger.error({ event: 'ERROR_DETECTED', type: wrapped.type, message: wrapped.message });
            return false;
        }
    }

    async sendPrompt(prompt, type = 'AUDIT') {
        if (!this.initialized) {
            throw createClaudeError({
                type: 'BROWSER_ERROR',
                message: 'ClaudeManager not initialized. sendPrompt() requires prior bootstrap.'
            });
        }

        this.metrics.totalRequests += 1;
        const startedAt = Date.now();
        this.dumpedHtml = false;

        this.logger.info({
            event: 'PROMPT_BEFORE_SEND',
            promptLength: prompt.length,
            first200Chars: prompt.substring(0, 200)
        });

        try {
            const result = await this.retry(async (attemptNumber) => {
                const page = await this.browserManager.getPage();
                await this._ensureClaudeHome(page, true);

                this.logger.info({
                    event: 'CLAUDE_SEND_PROMPT',
                    promptLength: prompt.length
                });

                await this._sendPromptOnce(page, prompt, attemptNumber);
                const finalResponse = await this.waitForResponse(page, prompt);
                this.validateResponse(finalResponse, prompt, type);
                
                const currentUrl = page.url();
                const chatId = this._extractChatId(currentUrl);

                this.logger.info({ event: 'RESPONSE_VALIDATED', length: finalResponse.text.length, chatId, url: currentUrl });
                
                return {
                    ...finalResponse,
                    chatId,
                    url: currentUrl
                };
            });

            this.metrics.successfulRequests += 1;
            return result;
        } catch (error) {
            this.metrics.failedRequests += 1;
            throw error;
        } finally {
            this.metrics.totalResponseTimeMs += Date.now() - startedAt;
        }
    }

    _extractChatId(url) {
        if (!url) return null;
        const match = url.match(/\/chat\/([a-f0-9-]+)/);
        return match ? match[1] : null;
    }

    async waitForResponse(page, prompt) {
        const pollIntervalMs = 1000;
        const maxWaitMs = this.config.promptTimeoutMs;
        const startedAt = Date.now();
        let previousLength = 0;
        let currentLength = 0;
        let stableCounter = 0;

        while (Date.now() - startedAt < maxWaitMs) {
            // Check if browser died during poll
            if (!(await this.browserManager.isHealthy())) {
                throw createClaudeError({
                    type: 'BROWSER_DISCONNECTED',
                    retryable: true,
                    message: 'Browser disconnected during response wait'
                });
            }

            const completionSignals = await this.detectCompletion(page, { stableCounter });
            const state = await this._readResponseState(page);
            currentLength = state.text.length;

            if (currentLength === previousLength) {
                stableCounter += 1;
            } else {
                stableCounter = 0;
            }

            previousLength = currentLength;

            if (stableCounter >= 5) {
                if (completionSignals.done) {
                    const response = {
                        text: state.text.trim(),
                        html: state.html
                    };
                    this.logger.info({ 
                        event: 'RESPONSE_CAPTURED', 
                        responseType: typeof response,
                        textLength: response?.text?.length,
                        htmlLength: response?.html?.length 
                    });
                    this.logger.info({ event: 'GENERATION_COMPLETED', stableCounter, length: currentLength });
                    return response;
                }
            }

            const detectedError = await this.detectErrors(page, { prompt });
            if (detectedError) {
                throw detectedError;
            }

            this.logger.info({
                event: 'GENERATION_STARTED',
                stableCounter,
                currentLength,
                stopVisible: completionSignals.stopVisible
            });

            await this._sleep(pollIntervalMs);
        }

        throw createClaudeError({
            type: 'PARTIAL_RESPONSE',
            retryable: true,
            message: 'Claude response timed out before stabilizing',
            details: { promptLength: prompt.length }
        });
    }

    async detectCompletion(page, state = {}) {
        const stopVisible = await this.isAnyVisible(page, SELECTORS.stopButton, 1);
        const inputReady = await this._isInputReady(page);
        const responseStable = (state.stableCounter || 0) >= 5;
        const signals = [!stopVisible, inputReady, responseStable];
        const positiveSignals = signals.filter(Boolean).length;

        return {
            done: !stopVisible && inputReady && responseStable && positiveSignals >= 2,
            stopVisible,
            inputReady,
            responseStable,
            positiveSignals
        };
    }

    async detectErrors(page, context = {}) {
        // 1. Fundamental health check first
        if (!page || page.isClosed?.() || !(await this.browserManager.isHealthy())) {
            this.initialized = false;
            return createClaudeError({
                type: 'BROWSER_DISCONNECTED',
                retryable: true,
                message: 'Browser or page is disconnected',
                details: context
            });
        }

        const snapshot = await this._getPageSnapshot(page);
        const text = snapshot.text.toLowerCase();
        const url = (snapshot.url || '').toLowerCase();

        if (this.browserManager.contextClosed || this.browserManager.pageClosed) {
            this.initialized = false;
            return createClaudeError({
                type: 'BROWSER_DISCONNECTED',
                retryable: true,
                message: 'Browser context or page is disconnected',
                details: context
            });
        }

        // Removed text-based 'SESSION_EXPIRED' check because the text we paste 
        // into Claude might contain words like "log in" or "sign in" (e.g. from an article)
        // which triggers a false positive. We only check if the URL explicitly redirects to login.
        if (url.includes('/login') || url.includes('auth0.com')) {
            this.logger.warn({ event: 'SESSION_EXPIRED_MATCH', url, matchedText: text.substring(0, 500) });
            return createClaudeError({
                type: 'SESSION_EXPIRED',
                retryable: false,
                message: 'Claude login page or session expiration detected',
                details: { url }
            });
        }

        if (text.includes('rate limit') || text.includes('too many requests')) {
            return createClaudeError({
                type: 'RATE_LIMIT',
                retryable: true,
                message: 'Claude rate limit detected',
                details: { url }
            });
        }

        if (text.includes('overloaded') || text.includes('busy')) {
            return createClaudeError({
                type: 'RATE_LIMIT',
                retryable: true,
                message: 'Claude overloaded',
                details: { url }
            });
        }

        if (text.includes('network error') || text.includes('failed to fetch') || text.includes('net::')) {
            return createClaudeError({
                type: 'NETWORK_ERROR',
                retryable: true,
                message: 'Network failure detected',
                details: { url }
            });
        }

        if (text.includes('something went wrong') || text.includes('try again') || text.includes('message failed')) {
            return createClaudeError({
                type: 'PARTIAL_RESPONSE',
                retryable: true,
                message: 'Claude returned a failure message',
                details: { url }
            });
        }

        // Removed text-based check for "captcha" because user prompts often contain 
        // the word "captcha" or "cloudflare" (e.g. tech articles).
        // Instead we check the page title or URL.
        const title = await page.title().catch(() => '');
        if (title.toLowerCase().includes('just a moment') || title.toLowerCase().includes('cloudflare')) {
            return createClaudeError({
                type: 'UI_CHANGED',
                retryable: false,
                message: 'Claude challenge or UI gate detected',
                details: { url }
            });
        }

        if (context.prompt && !snapshot.text.trim()) {
            return createClaudeError({
                type: 'EMPTY_RESPONSE',
                retryable: true,
                message: 'Empty Claude response detected',
                details: { url }
            });
        }

        return null;
    }

    validateResponse(response, prompt, type = 'AUDIT') {
        const rawText =
            typeof response === 'object' && response !== null
                ? (response.text || '')
                : String(response || '');

        const text = rawText.trim();
        const responseType = typeof response;
        const textLength = text.length;
        const htmlLength = response?.html?.length || 0;

        this.logger.info({
            event: 'VALIDATION_INPUT',
            responseType,
            textLength,
            htmlLength,
            jobType: type
        });

        if (!text) {
            throw new ValidationError('Claude response is empty', 'EMPTY_RESPONSE', true, { promptLength: prompt.length });
        }

        // 1. Minimum length check
        const minLength = type === 'REWRITE' ? 300 : 150;
        if (textLength < minLength) {
            throw new ValidationError(`Claude response too short (${textLength} chars)`, 'SHORT_RESPONSE', false, { length: textLength, minRequired: minLength });
        }

        // 2. Refusal Detection (False Positives)
        const lower = text.toLowerCase();
        const refusalPhrases = [
            'please provide',
            'i can help you audit',
            'i need the article',
            'no text was supplied',
            'paste the article',
            'i am ready to',
            'submit the content',
            'once you provide',
            'waiting for your content',
            'did not include any content',
            'you haven\'t provided'
        ];

        if (refusalPhrases.some(phrase => lower.includes(phrase))) {
            throw new InvalidResponseQualityError('Claude requested content instead of processing it', { sample: text.substring(0, 100) });
        }

        // 3. Structure Validation
        if (type === 'AUDIT') {
            const auditMarkers = [
                'score',
                'recommendation',
                'issue',
                'eeat',
                'readability',
                'intent'
            ];
            const hasAuditMarkers = auditMarkers.some(marker => lower.includes(phrase => lower.includes(marker)));
            
            // More robust check: Check for actual headers or score patterns
            const hasScore = /\d+\/\d+/.test(text) || /score:?\s*\d+/i.test(text);
            const hasSections = /(recommendations|issues|summary|eeat|readability|intent):/i.test(text);

            if (!hasScore && !hasSections) {
                throw new InvalidResponseQualityError('Response lacks audit structure (scores or sections)');
            }
        }

        if (type === 'REWRITE') {
            // Rewrite should not contain assistant preambles or instructions
            const instructionPhrases = [
                'here is the optimized',
                'i have rewritten',
                'the following is a rewrite',
                'let me know if you',
                'i\'ve optimized'
            ];
            
            // If it starts with a preamble and is long, it's poor quality (should be clean content)
            if (instructionPhrases.some(phrase => lower.substring(0, 100).includes(phrase)) && textLength < 1000) {
                 this.logger.warn({ event: 'PREAMBLE_DETECTED', message: 'Rewrite contains assistant preamble' });
            }

            // Must have substantial overlap with the prompt's subject (not just a template)
            if (text.includes('Return ONLY the optimized content')) {
                throw new InvalidResponseQualityError('Response contains prompt instructions instead of content');
            }
        }

        if (text === prompt.trim()) {
            throw new ValidationError('Claude response matches prompt', 'SHORT_RESPONSE', false, { length: textLength });
        }

        if (SELECTORS.failureIndicators.some((needle) => lower.includes(needle.toLowerCase()))) {
            throw new ValidationError('Claude failure message detected', 'SHORT_RESPONSE', false, { length: textLength });
        }

        if (!this._containsMeaningfulContent(text)) {
            throw new ValidationError('Claude response lacks meaningful content', 'SHORT_RESPONSE', false, { length: textLength });
        }

        return true;
    }

    async retry(operation) {
        const backoffScheduleMs = [1000, 2000, 4000, 8000, 16000];
        let lastError = null;

        for (let attempt = 1; attempt <= backoffScheduleMs.length + 1; attempt += 1) {
            try {
                if (attempt > 1) {
                    this.metrics.retries += 1;
                    this.logger.info({ event: 'RETRY_STARTED', attempt });
                }

                // Check health before trying
                if (!(await this.browserManager.isHealthy())) {
                    throw createClaudeError({
                        type: 'BROWSER_DISCONNECTED',
                        retryable: true,
                        message: 'Browser not healthy before retry'
                    });
                }

                return await operation(attempt);
                } catch (error) {

                const wrapped = normalizeError(error);
                lastError = wrapped;

                if (['SESSION_EXPIRED', 'BROWSER_DISCONNECTED', 'UI_CHANGED'].includes(wrapped.type)) {
                    this.initialized = false;
                    const recovery = await this.recover(wrapped);
                    
                    if (wrapped.retryable && attempt <= backoffScheduleMs.length && recovery.status !== 'UI_CHANGED_BROWSER_DOWN') {
                        this.logger.info({ event: 'RETRYING_AFTER_RECOVERY', attempt, type: wrapped.type });
                        await this._sleep(backoffScheduleMs[attempt - 1]);
                        continue;
                    }
                    throw wrapped;
                }

                if (!this._isRetryable(wrapped)) {
                    throw wrapped;
                }

                if (attempt > backoffScheduleMs.length) {
                    throw wrapped;
                }

                await this._sleep(backoffScheduleMs[attempt - 1]);
            }
        }

        throw lastError || createClaudeError({ message: 'Claude retry failed' });
    }

    async recover(error) {
        this.logger.info({ event: 'RECOVERY_STARTED', type: error.type, message: error.message });
        
        // Force DEGRADED state immediately to break BUSY lock and pause queue
        this.workerState.setState(WORKER_STATES.DEGRADED, `recovery_triggered_by_${error.type.toLowerCase()}`);

        if (error.type === 'SESSION_EXPIRED') {
            await this.browserManager.restart('session expired');
            return { status: 'DEGRADED_WAITING_FOR_LOGIN' };
        }

        if (error.type === 'BROWSER_DISCONNECTED') {
            await this.browserManager.restart('browser disconnected');
            return { status: 'BROWSER_RESTARTED' };
        }

        if (error.type === 'UI_CHANGED') {
            const page = await this.browserManager.getPage().catch(() => null);
            if (page) {
                const report = await this._captureDiagnostics(page);
                return { status: 'DIAGNOSTIC_REPORT', report };
            }
            return { status: 'UI_CHANGED_BROWSER_DOWN' };
        }

        await this.browserManager.restart(error.message);
        return { status: 'RECOVERED' };
    }

    getStatus() {
        const successfulRequests = this.metrics.successfulRequests;
        const totalRequests = this.metrics.totalRequests;
        const successRate = totalRequests === 0 ? 100 : Number(((successfulRequests / totalRequests) * 100).toFixed(1));
        const avgResponseTimeMs = successfulRequests === 0 ? 0 : Math.round(this.metrics.totalResponseTimeMs / successfulRequests);

        return {
            healthy: this.workerState.getState() === WORKER_STATES.READY,
            successRate,
            queueLength: this.queueLengthProvider(),
            avgResponseTimeMs,
            totalRequests,
            successfulRequests,
            failedRequests: this.metrics.failedRequests,
            retries: this.metrics.retries,
            browser: Boolean(this.browserManager.context) && !this.browserManager.contextClosed,
            page: Boolean(this.browserManager.claudePage) && !(this.browserManager.claudePage?.isClosed?.() ?? true) && !this.browserManager.pageClosed,
            session: this.sessionStatusProvider()
        };
    }

    async _sendPromptOnce(page, prompt, attemptNumber) {
        let input = null;
        const maxWaitMs = 15000;
        const start = Date.now();
        
        while (Date.now() - start < maxWaitMs) {
            input = await this.findFirstAvailable(page, SELECTORS.input);
            if (input) break;
            await this._sleep(1000);
        }

        if (!input) {
            throw createClaudeError({
                type: 'UI_CHANGED',
                retryable: false,
                message: 'Claude input selector not found',
                details: { attemptNumber }
            });
        }

        const browser = this.browserManager.context?.browser?.();
        this.logger.info({ 
            event: 'DIAGNOSTIC_BEFORE_INTERACTION', 
            browserConnected: browser?.isConnected?.(), 
            pageClosed: page?.isClosed?.(), 
            currentUrl: page?.url?.() 
        });

        this.logger.info({ event: 'INPUT_SELECTOR_FOUND', selector: input });
        const inputLocator = page.locator(input).first();
        await this._focusAndClearInput(page, inputLocator);

        const beforeText = await this._readInputValue(page, inputLocator);
        
        this.logger.info({ event: 'TYPING_STARTED', length: prompt.length });
        try {
            // First ensure it's clicked and focused
            await inputLocator.click();
            await this._sleep(500);
            
            // Instead of .fill() which can fail silently on complex ProseMirror/React editors,
            // or chunking which scrambles text, we insert the entire string atomically.
            await page.keyboard.insertText(prompt);
        } catch (insertError) {
            this.logger.warn({ event: 'INSERT_TEXT_FAILED', message: insertError.message });
        }
        // Small pause to let the UI settle
        await this._sleep(2000);

        const afterText = await this._readInputValue(page, inputLocator);
        const afterLength = afterText?.length || 0;
        
        this.logger.info({ 
            event: 'TYPING_VERIFICATION', 
            beforeLength: beforeText.length, 
            afterLength: afterLength,
            expectedLength: prompt.length
        });

        // Use length-based verification for robustness with contenteditable elements
        // If we expect >100 chars, and got at least 50 chars, we consider it successfully populated
        const minExpectedLength = Math.min(50, prompt.length / 2);
        
        if (afterLength < minExpectedLength) { 
            try {
                const html = await page.content();
                require('fs').writeFileSync('/Users/abhinaykalkhanday/Desktop/n8n/claude_fail_dump.html', html);
            } catch (e) {}
            
            throw createClaudeError({
                type: 'PARTIAL_RESPONSE',
                retryable: true,
                message: 'Prompt did not persist in input',
                details: { 
                    beforeLength: beforeText.length, 
                    afterLength: afterLength, 
                    expectedLength: prompt.length,
                    chosenSelector: input
                }
            });
        }

        this.logger.info({ event: 'PROMPT_FILLED', length: prompt.length });

        const submitted = await this._attemptSubmit(page, inputLocator, prompt);
        if (!submitted) {
            throw createClaudeError({
                type: 'NETWORK_ERROR',
                retryable: true,
                message: 'Unable to submit prompt',
                details: { attemptNumber }
            });
        }

        return { validationResponse: null };
    }

    async _attemptSubmit(page, inputLocator, prompt) {
        await inputLocator.press('Enter').catch(async () => {
            await page.keyboard.press('Enter').catch(() => {});
        });

        // Small delay to allow UI to react
        await this._sleep(500);

        if (await this._submissionStarted(page, prompt)) {
            return true;
        }

        const sendSelector = await this.findFirstAvailable(page, SELECTORS.sendButton);
        if (sendSelector) {
            const browser = this.browserManager.context?.browser?.();
            this.logger.info({ 
                event: 'DIAGNOSTIC_BEFORE_SEND_CLICK', 
                browserConnected: browser?.isConnected?.(), 
                pageClosed: page?.isClosed?.(), 
                currentUrl: page?.url?.() 
            });
            this.logger.info({ event: 'CLICKING_SEND_BUTTON', selector: sendSelector });
            await page.locator(sendSelector).first().click({ force: true }).catch(() => {});
        }

        // Delay after click
        await this._sleep(500);

        if (await this._submissionStarted(page, prompt)) {
            return true;
        }

        return false;
    }

    async _submissionStarted(page, prompt) {
        const input = await this.findFirstAvailable(page, SELECTORS.input, 2).catch(() => null);
        const composer = input ? page.locator(input).first() : null;
        const composerText = composer ? await this._readInputValue(page, composer) : '';
        const stopVisible = await this.isAnyVisible(page, SELECTORS.stopButton, 1);

        // Use length heuristic to avoid whitespace mismatch false positives.
        // If composer has less than half the prompt, it was likely cleared.
        const isComposerCleared = composerText.length < (prompt.length / 2);

        return stopVisible || isComposerCleared;
    }

    async _ensureClaudeHome(page, forceNavigation = false) {
        const currentUrl = page.url();
        const isClaude = currentUrl.includes('claude.ai');
        
        if (forceNavigation || !isClaude) {
            this.logger.info({ 
                event: 'NAVIGATION_DEBUG', 
                currentUrl, 
                forceNavigation,
                isClaude,
                destination: 'https://claude.ai' 
            });
            this.logger.info({ event: 'NAVIGATING_TO_CLAUDE', url: 'https://claude.ai' });
            
            this.logger.info({ event: 'DEBUG_STEP', step: 'starting_goto' });
            await page.goto('https://claude.ai', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            }).catch(e => {
                this.logger.warn({ event: 'GOTO_TIMEOUT_OR_ERROR', message: e.message });
            });
            this.logger.info({ event: 'DEBUG_STEP', step: 'finished_goto' });
            this.logger.info({ event: 'DEBUG_STEP', step: 'finished_human_emulation' });

            this.logger.info({ event: 'DEBUG_STEP', step: 'starting_url_check' });
            
            // Turnstile actively monitors and penalizes CDP DOM evaluation (`page.evaluate`, `waitForSelector`).
            // We must NOT query the DOM while the challenge is running.
            // Instead, we wait for the Turnstile redirect to finish and check the final URL.
            try {
                // Wait up to 15 seconds for Turnstile to either redirect to /login or finish loading the app.
                // We use waitForURL specifically because it relies passively on CDP navigation events and
                // does NOT inject evaluation scripts into the renderer like waitForSelector or waitForFunction.
                await page.waitForURL('**/login', { timeout: 15000 }).catch(() => {});
            } catch (e) {
                // Ignore timeout
            }

            const finalUrl = page.url();
            this.logger.info({ event: 'DEBUG_STEP', step: 'finished_url_check', url: finalUrl });

            if (finalUrl.includes('/login')) {
                const err = new Error('DETECTED_LOGGED_OUT');
                err.type = 'SESSION_EXPIRED';
                throw err;
            }
            
            // As a fallback, if we are still on the root path, we can safely check the DOM now that Turnstile is done
            const loginSelectors = SELECTORS.loginIndicators.map(ind => `text="${ind}"`);
            let winner = null;
            try {
                winner = await this.findFirstAvailable(page, loginSelectors, 3);
            } catch (err) {
                // Ignore timeout, it just means they are not logged out
            }
            
            if (winner) {
                const err = new Error('DETECTED_LOGGED_OUT');
                err.type = 'SESSION_EXPIRED';
                throw err;
            }

            this.logger.info({ event: 'DEBUG_STEP', step: 'finished_promise_race' });

            await this._sleep(1000);
        }
    }

    async findFirstAvailable(page, selectors, maxRetries = 15) {
        try {
            const promises = selectors.map(async (sel) => {
                let locatorString = sel;
                if (sel.startsWith('text=')) {
                    // Playwright text locator
                    locatorString = sel;
                }
                
                // Wait for the element to be visible
                await page.waitForSelector(locatorString, { 
                    state: 'visible', 
                    timeout: maxRetries * 1000 
                });
                return sel;
            });

            // Any of the promises resolving means we found a selector
            return await Promise.any(promises);
        } catch (error) {
            this.logger.error({ event: 'FIND_FIRST_AVAILABLE_ERROR', error: error.message });
            throw new Error('Timeout waiting for any selector');
        }
    }

    async isAnyVisible(page, selectors, maxRetries = 1) {
        try {
            await this.findFirstAvailable(page, selectors, maxRetries);
            return true;
        } catch (e) {
            return false;
        }
    }

    SELECTORS_MATCH(text, url, indicators) {
        const lower = `${text}\n${url}`.toLowerCase();
        return indicators.some((indicator) => {
            const ind = indicator.toLowerCase();
            // Escape special regex characters in the indicator just in case
            const escapedInd = ind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`\\b${escapedInd}\\b`).test(lower);
        });
    }

    async _readResponseState(page) {
        return await this._getLatestAssistantContent(page);
    }

    async _getPageSnapshot(page) {
        // Use evaluate instead of locator to avoid injecting Playwright's utility scripts, which trigger Cloudflare Turnstile
        const text = await page.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');
        return {
            text: String(text || ''),
            url: typeof page.url === 'function' ? page.url() : ''
        };
    }

    async _getLatestAssistantContent(page) {
        let textFound = '';
        let htmlFound = '';
        let matchedSelector = null;
        let debugInfo = [];

        for (const selector of SELECTORS.assistantMessage) {
            try {
                const locator = page.locator(selector);
                const count = await locator.count();
                const isVis = count > 0 ? await locator.first().isVisible().catch(() => false) : false;
                
                debugInfo.push({ selector, count, isVis });

                if (count > 0 && isVis) {
                    for (let index = count - 1; index >= 0; index -= 1) {
                        const node = locator.nth(index);
                        const text = (await node.textContent().catch(() => '')).trim();
                        if (text) {
                            textFound = text;
                            htmlFound = await node.innerHTML().catch(() => '');
                            matchedSelector = selector;
                            break;
                        }
                    }
                }
            } catch (error) {
                debugInfo.push({ selector, error: error.message });
            }
            if (textFound) break;
        }

        if (!textFound) {
            this.logger.info({ event: 'ASSISTANT_CONTENT_EMPTY', message: 'No selector returned non-empty text', debugInfo });
            if (!this.dumpedHtml) {
                this.dumpedHtml = true;
                const html = await page.content().catch(() => '');
                fs.writeFileSync(path.join(process.cwd(), 'logs', 'page_dump.html'), html);
                this.logger.info({ event: 'HTML_DUMPED', path: 'logs/page_dump.html' });
            }
        } else {
            this.logger.info({ event: 'ASSISTANT_CONTENT_FOUND', selector: matchedSelector, length: textFound.length });
        }

        return { text: textFound, html: htmlFound };
    }

    async _getLatestAssistantText(page) {
        const content = await this._getLatestAssistantContent(page);
        return content.text;
    }

    async _readInputValue(page, locator) {
        const tagName = await locator.evaluate((node) => node.tagName.toLowerCase()).catch(() => '');
        if (tagName === 'textarea' || tagName === 'input') {
            return await locator.inputValue().catch(() => '');
        }

        // Avoid innerText to prevent layout thrashing crashes
        return await locator.evaluate((node) => node.textContent || '').catch(() => '');
    }

    async _focusAndClearInput(page, locator) {
        await locator.click({ force: true }).catch(() => {});
        await locator.focus().catch(() => {});
    }

    async _isInputReady(page) {
        const selector = await this.findFirstAvailable(page, SELECTORS.input);
        if (!selector) {
            return false;
        }

        const locator = page.locator(selector).first();
        const disabled = await locator.isDisabled().catch(() => false);
        const editable = await locator.isEditable().catch(() => true);
        return !disabled && editable;
    }

    async _captureDiagnostics(page) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dir = path.join(process.cwd(), 'logs');
        fs.mkdirSync(dir, { recursive: true });

        const screenshotPath = path.join(dir, `claude-ui-change-${timestamp}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

        const selectors = {
            input: SELECTORS.input,
            stopButton: SELECTORS.stopButton,
            sendButton: SELECTORS.sendButton,
            assistantMessage: SELECTORS.assistantMessage
        };

        const report = {
            type: 'UI_CHANGED',
            screenshotPath,
            url: page.url(),
            selectors
        };

        this.lastDiagnostics = report;
        this.logger.error({ event: 'ERROR_DETECTED', type: 'UI_CHANGED', screenshotPath });
        return report;
    }

    _containsMeaningfulContent(text) {
        const stripped = text.replace(/\s+/g, ' ').trim();
        const words = stripped.split(' ').filter(Boolean);
        return stripped.length >= 100 && words.length >= 20;
    }

    _isRetryable(error) {
        return ['RATE_LIMIT', 'NETWORK_ERROR', 'PARTIAL_RESPONSE', 'EMPTY_RESPONSE'].includes(error.type);
    }

    async _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

module.exports = {
    ClaudeManager,
    SELECTORS
};

