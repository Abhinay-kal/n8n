const FAILURE_CATEGORIES = Object.freeze({
    CLAUDE_TIMEOUT: 'CLAUDE_TIMEOUT',
    CLAUDE_REFUSAL: 'CLAUDE_REFUSAL',
    BROWSER_ERROR: 'BROWSER_ERROR',
    NAVIGATION_ERROR: 'NAVIGATION_ERROR',
    SESSION_ERROR: 'SESSION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    UNKNOWN: 'UNKNOWN'
});

class FailureClassifier {
    static classify(error) {
        if (!error) return FAILURE_CATEGORIES.UNKNOWN;

        const message = (error.message || '').toLowerCase();
        const type = error.type || '';

        if (type === 'SESSION_EXPIRED') return FAILURE_CATEGORIES.SESSION_ERROR;
        if (type === 'RATE_LIMIT') return FAILURE_CATEGORIES.RATE_LIMIT;
        if (type === 'BROWSER_DISCONNECTED') return FAILURE_CATEGORIES.BROWSER_ERROR;
        if (type === 'PARTIAL_RESPONSE' && message.includes('timed out')) return FAILURE_CATEGORIES.CLAUDE_TIMEOUT;
        if (message.includes('refusal') || message.includes('policy')) return FAILURE_CATEGORIES.CLAUDE_REFUSAL;
        if (message.includes('navigation') || message.includes('timeout')) return FAILURE_CATEGORIES.NAVIGATION_ERROR;

        return FAILURE_CATEGORIES.UNKNOWN;
    }
}

module.exports = { FailureClassifier, FAILURE_CATEGORIES };
