class QueueService {
    constructor() {
        this.pending = {
            HIGH: [],
            NORMAL: [],
            BULK: []
        };
        this.active = false;
        this.paused = false;
    }

    get size() {
        return this.pending.HIGH.length + 
               this.pending.NORMAL.length + 
               this.pending.BULK.length + 
               (this.active ? 1 : 0);
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        this._drain().catch(() => {});
    }

    add(task, priority = 'NORMAL') {
        return new Promise((resolve, reject) => {
            if (!this.pending[priority]) {
                priority = 'NORMAL';
            }
            this.pending[priority].push({ task, resolve, reject });
            this._drain().catch(reject);
        });
    }

    async _drain() {
        if (this.active || this.paused) {
            return;
        }

        const job = this._getNextJob();
        if (!job) {
            return;
        }

        this.active = true;

        try {
            const result = await job.task();
            job.resolve(result);
        } catch (error) {
            job.reject(error);
        } finally {
            this.active = false;
            if (this.size > 0 && !this.paused) {
                await this._drain();
            }
        }
    }

    _getNextJob() {
        if (this.pending.HIGH.length > 0) return this.pending.HIGH.shift();
        if (this.pending.NORMAL.length > 0) return this.pending.NORMAL.shift();
        if (this.pending.BULK.length > 0) return this.pending.BULK.shift();
        return null;
    }
}

module.exports = { QueueService };