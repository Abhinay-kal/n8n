const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseConnection {
    constructor(config) {
        this.config = config;
        this.db = null;
    }

    async connect() {
        try {
            const dbPath = this.config.dbPath || path.join(process.cwd(), 'jobs.sqlite');
            const dbDir = path.dirname(dbPath);

            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new Database(dbPath, {
                // verbose: console.log
            });

            // Enable WAL mode for better concurrency
            this.db.pragma('journal_mode = WAL');
            
            return this.db;
        } catch (error) {
            console.error('Failed to connect to database:', error);
            throw error;
        }
    }

    get() {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

module.exports = DatabaseConnection;
