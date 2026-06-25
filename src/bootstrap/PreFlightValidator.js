const fs = require('node:fs');
const path = require('node:path');

class PreFlightValidator {
    constructor() {
        this.errors = [];
        this.actions = [];
    }

    validateEnv() {
        const envPath = path.join(process.cwd(), '.env');
        
        // If the .env file exists, ensure it loads correctly.
        // If it doesn't exist, we consider it a failure based on "Fail immediately if dotenv cannot load"
        // interpreting it as .env is a required part of the "production-style system".
        if (!fs.existsSync(envPath)) {
            this.errors.push(`Environment Error: .env file not found at ${envPath}`);
            return false;
        }

        try {
            const dotenv = require('dotenv');
            const result = dotenv.config();
            if (result.error) {
                this.errors.push(`Environment Error: Failed to parse .env file: ${result.error.message}`);
                return false;
            }
        } catch (err) {
            this.errors.push(`Environment Error: Dotenv library missing or failed: ${err.message}`);
            return false;
        }

        return true;
    }

    validateConfig(config) {
        const required = ['PORT', 'CLAUDE_PROFILE_PATH', 'CLAUDE_HEADLESS'];
        const missing = [];

        if (!process.env.PORT && !config.port) missing.push('PORT');
        if (!process.env.CLAUDE_PROFILE_PATH) missing.push('CLAUDE_PROFILE_PATH');
        if (process.env.CLAUDE_HEADLESS === undefined) missing.push('CLAUDE_HEADLESS');

        if (missing.length > 0) {
            this.errors.push(`Missing Configuration: \n- ${missing.join('\n- ')}`);
        }

        return this.errors.length === 0;
    }

    validateProfile(profilePath) {
        if (!profilePath) {
            this.errors.push('Claude Profile Error: Profile path is not defined.');
            return false;
        }

        const resolvedPath = path.resolve(profilePath);
        const allowedRoot = path.resolve(process.cwd());

        // Basic path traversal protection: verify profilePath stays within root directory
        if (!resolvedPath.startsWith(allowedRoot)) {
            this.errors.push(`Claude Profile Error: Profile path (${resolvedPath}) is outside the approved directory (${allowedRoot}).`);
            return false;
        }

        if (!fs.existsSync(resolvedPath)) {
            this.errors.push(`Claude Profile Error: Directory does not exist at ${resolvedPath}`);
            return false;
        }

        try {
            // Check for both read and write permissions
            fs.accessSync(resolvedPath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            this.errors.push(`Claude Profile Error: \nReason:\nDirectory exists but is not readable/writable.\n\nSuggested Fix:\nchmod -R +rw ${resolvedPath}`);
            return false;
        }

        return true;
    }

    ensureDirectories(directories) {
        for (const dir of directories) {
            const resolvedPath = path.resolve(dir);
            if (!fs.existsSync(resolvedPath)) {
                try {
                    fs.mkdirSync(resolvedPath, { recursive: true });
                    this.actions.push(`Created ${dir}/`);
                } catch (err) {
                    this.errors.push(`Directory Creation Failed: Could not create ${dir}.\nReason: ${err.message}`);
                    continue;
                }
            }

            try {
                fs.accessSync(resolvedPath, fs.constants.W_OK);
            } catch (err) {
                this.errors.push(`Directory Permission Error: ${dir} is not writable.\nReason: ${err.message}`);
            }
        }
        return this.errors.length === 0;
    }

    getErrors() {
        return this.errors;
    }

    getActions() {
        return this.actions;
    }
}

module.exports = { PreFlightValidator };
