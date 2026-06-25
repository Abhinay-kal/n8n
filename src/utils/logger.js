const SENSITIVE_KEYS = ['authorization', 'x-api-key', 'cookie', 'token', 'password', 'secret', 'apikey', 'api_key'];

function redact(obj, depth = 0) {
    if (depth > 5) return '[TOO_DEEP]'; // Prevent infinite recursion/DoS
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => redact(item, depth + 1));
    }
    const redacted = {};
    for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
            redacted[key] = '[REDACTED]';
        } else {
            redacted[key] = redact(obj[key], depth + 1);
        }
    }
    return redacted;
}

function normalizePayload(messageOrObject, meta) {
    let payload;
    if (messageOrObject && typeof messageOrObject === 'object' && !Array.isArray(messageOrObject) && meta === undefined) {
        payload = messageOrObject;
    } else if (typeof messageOrObject === 'string') {
        payload = meta && typeof meta === 'object'
            ? { message: messageOrObject, ...meta }
            : { message: messageOrObject, meta };
    } else {
        payload = { message: String(messageOrObject) };
    }
    
    return redact(payload);
}

function write(scope, level, payload) {
    const record = {
        timestamp: new Date().toISOString(),
        scope,
        level,
        ...payload
    };

    const line = JSON.stringify(record);
    try {
        require('fs').appendFileSync('claude_debug.log', line + '\n');
    } catch (e) {}

    if (level === 'error') {
        console.error(line);
        return;
    }

    if (level === 'warn') {
        console.warn(line);
        return;
    }

    console.log(line);
}

function createLogger(scope) {
    return {
        info(messageOrObject, meta) {
            write(scope, 'info', normalizePayload(messageOrObject, meta));
        },
        warn(messageOrObject, meta) {
            write(scope, 'warn', normalizePayload(messageOrObject, meta));
        },
        error(messageOrObject, meta) {
            write(scope, 'error', normalizePayload(messageOrObject, meta));
        },
        debug(messageOrObject, meta) {
            write(scope, 'debug', normalizePayload(messageOrObject, meta));
        }
    };
}

module.exports = {
    createLogger
};
