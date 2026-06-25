class LogRepository {
    constructor(db) {
        this.db = db;
    }

    async createExecutionLog({
        job_id,
        site_id,
        project_id = null,
        execution_type,
        prompt_used,
        response_received = null,
        runtime_ms = null,
        status,
        error_category = null,
        metadata = null
    }) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO execution_logs (
                job_id, site_id, project_id, execution_type, prompt_used, 
                response_received, runtime_ms, status, error_category, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            job_id, 
            site_id, 
            project_id, 
            execution_type, 
            prompt_used, 
            response_received, 
            runtime_ms, 
            status, 
            error_category, 
            metadata ? JSON.stringify(metadata) : null, 
            now
        );
        return info.lastInsertRowid;
    }

    async getLogsByJobId(jobId) {
        const stmt = this.db.prepare('SELECT * FROM execution_logs WHERE job_id = ? ORDER BY created_at DESC');
        return stmt.all(jobId);
    }

    async getLogsByProjectId(projectId) {
        const stmt = this.db.prepare('SELECT * FROM execution_logs WHERE project_id = ? ORDER BY created_at DESC');
        return stmt.all(projectId);
    }
}

class EventRepository {
    constructor(db) {
        this.db = db;
    }

    async createEvent({
        project_id,
        event_type,
        message = null,
        metadata = null
    }) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO project_events (
                project_id, event_type, message, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            project_id, 
            event_type, 
            message, 
            metadata ? JSON.stringify(metadata) : null, 
            now
        );
        return info.lastInsertRowid;
    }

    async getEventsByProjectId(projectId) {
        const stmt = this.db.prepare('SELECT * FROM project_events WHERE project_id = ? ORDER BY created_at DESC');
        return stmt.all(projectId);
    }
}

module.exports = { LogRepository, EventRepository };
