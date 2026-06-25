const { parseInteger } = require('./config');

function loadSecurityConfig() {
    const rawKeys = process.env.API_KEYS || '';
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    return {
        apiKeys,
        rateLimits: {
            rewrite: {
                windowMs: 60 * 1000,
                maxRequests: parseInteger(process.env.RATE_LIMIT_REWRITE, 10)
            },
            status: {
                windowMs: 60 * 1000,
                maxRequests: parseInteger(process.env.RATE_LIMIT_STATUS, 60)
            },
            health: {
                windowMs: 60 * 1000,
                maxRequests: parseInteger(process.env.RATE_LIMIT_HEALTH, 120)
            }
        },
        payloadLimits: {
            rewrite: process.env.PAYLOAD_LIMIT_REWRITE || '1mb'
        }
    };
}

module.exports = { loadSecurityConfig };
