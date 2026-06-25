const ALLOWED_TRANSITIONS = {
    'STARTING': ['READY', 'HEALTHY', 'BROKEN', 'DEGRADED'],
    'READY': ['BUSY', 'DEGRADED', 'BROKEN', 'RECOVERING', 'HEALTHY'],
    'HEALTHY': ['BUSY', 'DEGRADED', 'BROKEN', 'RECOVERING', 'READY'],
    'BUSY': ['READY', 'HEALTHY', 'DEGRADED', 'BROKEN'],
    'DEGRADED': ['READY', 'HEALTHY', 'BROKEN', 'RECOVERING'],
    'BROKEN': ['STARTING', 'READY', 'HEALTHY', 'RECOVERING', 'DEGRADED'],
    'RECOVERING': ['READY', 'HEALTHY', 'DEGRADED', 'BROKEN']
};

class StateMachine {
    /**
     * @param {Object} deps
     * @param {Object} deps.logger
     * @param {Object} deps.db
     */
    constructor({ logger, db }) {
        this.logger = logger;
        this.db = db;
        this.state = 'HEALTHY';
        this.history = [];
        this.MAX_HISTORY = 10;
        this.syncWithDatabase();
    }

    syncWithDatabase() {
        try {
            const stmt = this.db.prepare('SELECT state, reason FROM worker_state WHERE id = 1');
            const row = stmt.get();
            if (row && ALLOWED_TRANSITIONS[row.state]) {
                this.state = row.state;
                this._recordTransition('BOOT', row.state, row.reason || 'boot_sync');
            } else {
                this._persistState(this.state);
            }
        } catch (error) {
            this.logger.error({ event: 'STATE_SYNC_FAILED', error: error.message });
        }
    }

    /**
     * @param {string} newState
     * @param {string} [reason]
     * @returns {boolean} True if transition was successful
     */
    transition(newState, reason = 'state_update') {
        if (this.state === newState) {
            return true;
        }

        const allowed = ALLOWED_TRANSITIONS[this.state];
        if (!allowed || !allowed.includes(newState)) {
            this.logger.warn({
                event: 'INVALID_STATE_TRANSITION',
                from: this.state,
                to: newState,
                reason
            });
            return false;
        }

        const oldState = this.state;
        this.state = newState;
        
        this.logger.info({
            event: 'STATE_TRANSITION',
            from: oldState,
            to: newState,
            reason
        });

        this._recordTransition(oldState, newState, reason);
        this._persistState(newState, reason);
        return true;
    }

    getState() {
        return this.state;
    }

    getHistory() {
        return [...this.history];
    }

    /**
     * Forcefully resets the state to STARTING.
     * Used only by BootstrapManager to ensure a clean start regardless of persisted state.
     * @param {string} reason 
     */
    resetToStarting(reason = 'bootstrap_reset') {
        const oldState = this.state;
        this.state = 'STARTING';
        this._recordTransition(oldState, 'STARTING', reason);
        this._persistState('STARTING', reason);
    }

    _recordTransition(from, to, reason) {
        this.history.unshift({
            from,
            to,
            reason,
            timestamp: new Date().toISOString()
        });

        if (this.history.length > this.MAX_HISTORY) {
            this.history.pop();
        }
    }

    _persistState(state, reason = '') {
        try {
            const stmt = this.db.prepare(`
                UPDATE worker_state 
                SET state = ?, reason = ?, updated_at = datetime('now'), last_seen = datetime('now')
                WHERE id = 1
            `);
            stmt.run(state, reason);
        } catch (error) {
            this.logger.error({ event: 'STATE_PERSIST_FAILED', error: error.message });
        }
    }
}

module.exports = { StateMachine };