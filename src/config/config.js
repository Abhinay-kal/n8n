const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();

function parseInteger(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function loadConfig() {
    const rootDir = process.cwd();
    const explicitProfilePath = process.env.CLAUDE_PROFILE_PATH;
    const tempProfilePath = path.join(rootDir, 'temp-chrome-data');
    const chromeProfilePath = path.join(rootDir, 'chrome-profile');
    const explicitLooksLocked = Boolean(explicitProfilePath?.includes('chrome-profile'));
    const preferredCandidates = explicitLooksLocked
        ? [tempProfilePath, explicitProfilePath, chromeProfilePath]
        : [explicitProfilePath, tempProfilePath, chromeProfilePath];

    const profilePath = preferredCandidates
        .filter(Boolean)
        .find((candidate) => fs.existsSync(candidate)) || tempProfilePath;

    return {
        port: parseInteger(process.env.PORT, 3000),
        profilePath: path.resolve(profilePath),
        claudeUrl: process.env.CLAUDE_URL || 'https://claude.ai',
        browserChannel: process.env.CLAUDE_BROWSER_CHANNEL || 'chrome',
        headless: parseBoolean(process.env.CLAUDE_HEADLESS, false),
        navigationTimeoutMs: parseInteger(process.env.CLAUDE_NAVIGATION_TIMEOUT_MS, 30000),
        promptTimeoutMs: parseInteger(process.env.CLAUDE_PROMPT_TIMEOUT_MS, 90000),
        responseStableMs: parseInteger(process.env.CLAUDE_RESPONSE_STABLE_MS, 3000),
        sessionCheckIntervalMs: parseInteger(process.env.CLAUDE_SESSION_CHECK_INTERVAL_MS, 60000),
        sessionWaitTimeoutMs: parseInteger(process.env.CLAUDE_SESSION_WAIT_TIMEOUT_MS, 30000)
    };
}

module.exports = {
    loadConfig,
    parseBoolean,
    parseInteger
};
