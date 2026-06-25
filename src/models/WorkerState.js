const WORKER_STATES = Object.freeze({
    STARTING: 'STARTING',
    HEALTHY: 'HEALTHY',
    DEGRADED: 'DEGRADED',
    BROKEN: 'BROKEN',
    RECOVERING: 'RECOVERING',
    SHUTDOWN: 'SHUTDOWN',
    READY: 'READY', // Keeping for backward compatibility with existing ClaudeWorker.js
    BUSY: 'BUSY'    // Keeping for backward compatibility
});

class PersistentWorkerState {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.currentState = WORKER_STATES.STARTING;
        this.currentReason = 'startup';
        this._loadInitialState();
    }

    _loadInitialState() {
        try {
            const stmt = this.db.prepare('SELECT state, reason FROM worker_state WHERE id = 1');
            const row = stmt.get();
            if (row) {
                this.currentState = row.state;
                this.currentReason = row.reason;
            }
        } catch (err) {
            this.logger.error('Failed to load initial state', { error: err.message });
        }
    }

    setState(nextState, reason = '') {
        if (!Object.values(WORKER_STATES).includes(nextState)) {
            this.logger.error(`Attempted to set invalid state: ${nextState}`);
            return this.currentState;
        }

        if (this.currentState !== nextState) {
            this.logger.info(`state transition ${this.currentState} -> ${nextState}`, { reason });
        }

        this.currentState = nextState;
        this.currentReason = reason;

        try {
            const stmt = this.db.prepare(`
                UPDATE worker_state 
                SET state = ?, reason = ?, updated_at = datetime('now'), last_seen = datetime('now')
                WHERE id = 1
            `);
            stmt.run(nextState, reason);
        } catch (error) {
            this.logger.error('Failed to persist state', { error: error.message });
        }

        return this.currentState;
    }

    getState() {
        return this.currentState;
    }

    incrementRecoveryAttempts() {
        try {
            const stmt = this.db.prepare(`
                UPDATE worker_state 
                SET recovery_attempts = recovery_attempts + 1, updated_at = datetime('now')
                WHERE id = 1
            `);
            stmt.run();
        } catch (error) {
            this.logger.error('Failed to increment recovery attempts', { error: error.message });
        }
    }

    resetRecoveryAttempts() {
        try {
            const stmt = this.db.prepare(`
                UPDATE worker_state 
                SET recovery_attempts = 0, updated_at = datetime('now')
                WHERE id = 1
            `);
            stmt.run();
        } catch (error) {
            this.logger.error('Failed to reset recovery attempts', { error: error.message });
        }
    }

    getSnapshot(extra = {}) {
        let attempts = 0;
        try {
            const stmt = this.db.prepare('SELECT recovery_attempts FROM worker_state WHERE id = 1');
            const row = stmt.get();
            if (row) attempts = row.recovery_attempts;
        } catch (e) {}

        return {
            state: this.currentState,
            reason: this.currentReason,
            recoveryAttempts: attempts,
            ...extra
        };
    }
}

module.exports = {
    PersistentWorkerState,
    WORKER_STATES
};
