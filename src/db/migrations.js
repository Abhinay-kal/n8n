class Migrations {
    constructor(db) {
        this.db = db;
    }

    async run() {
        try {
            // 1. Create sites table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS sites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    domain TEXT NOT NULL,
                    wp_url TEXT,
                    wp_username TEXT,
                    wp_application_password TEXT,
                    active INTEGER DEFAULT 1,
                    created_at DATETIME NOT NULL
                )
            `);

            // 2. Create site_settings table (Revised)
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS site_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    version INTEGER DEFAULT 1,
                    audit_prompt TEXT,
                    rewrite_prompt TEXT,
                    country TEXT,
                    language TEXT,
                    target_location TEXT,
                    updated_at DATETIME NOT NULL,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            // 3. Create content_projects table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS content_projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    wp_post_id INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    metadata TEXT,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL,
                    UNIQUE(site_id, wp_post_id),
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            // 4. Create content_versions table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS content_versions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    project_id INTEGER NOT NULL,
                    version_number INTEGER NOT NULL,
                    content_type TEXT NOT NULL,
                    content TEXT,
                    metadata TEXT,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                    FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE CASCADE
                )
            `);

            // 5. Create audits table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS audits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    project_id INTEGER NOT NULL,
                    result TEXT,
                    score INTEGER,
                    metadata TEXT,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                    FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE CASCADE
                )
            `);

            // 6. Create rewrites table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS rewrites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    project_id INTEGER NOT NULL,
                    audit_id INTEGER,
                    optimized_content TEXT,
                    metadata TEXT,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                    FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE CASCADE,
                    FOREIGN KEY(audit_id) REFERENCES audits(id) ON DELETE SET NULL
                )
            `);

            // 7. Create job_chats table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS job_chats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id INTEGER NOT NULL,
                    chat_type TEXT,
                    claude_chat_id TEXT,
                    chat_url TEXT,
                    status TEXT NOT NULL,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
                )
            `);

            // 8. Create execution_logs table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS execution_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id INTEGER NOT NULL,
                    site_id INTEGER NOT NULL,
                    project_id INTEGER,
                    execution_type TEXT NOT NULL,
                    prompt_used TEXT,
                    response_received TEXT,
                    runtime_ms INTEGER,
                    status TEXT NOT NULL,
                    error_category TEXT,
                    metadata TEXT,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                    FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE SET NULL
                )
            `);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_execution_logs_job_id ON execution_logs(job_id)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_execution_logs_project_id ON execution_logs(project_id)`);

            // 9. Create project_events table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS project_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    event_type TEXT NOT NULL,
                    message TEXT,
                    metadata TEXT,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE CASCADE
                )
            `);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_project_events_project_id ON project_events(project_id)`);

            // 10. Create content repository tables
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS authors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    wp_author_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    UNIQUE(site_id, wp_author_id),
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            this.db.exec(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    wp_category_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    slug TEXT NOT NULL,
                    UNIQUE(site_id, wp_category_id),
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            this.db.exec(`
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    wp_tag_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    slug TEXT NOT NULL,
                    UNIQUE(site_id, wp_tag_id),
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            this.db.exec(`
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    wp_post_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    slug TEXT NOT NULL,
                    status TEXT NOT NULL,
                    modified DATETIME NOT NULL,
                    content TEXT,
                    excerpt TEXT,
                    author_id INTEGER,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL,
                    UNIQUE(site_id, wp_post_id),
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                    FOREIGN KEY(author_id) REFERENCES authors(id) ON DELETE SET NULL
                )
            `);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_site_id ON posts(site_id)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)`);

            this.db.exec(`
                CREATE TABLE IF NOT EXISTS sync_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    started_at DATETIME NOT NULL,
                    finished_at DATETIME,
                    status TEXT NOT NULL,
                    items_processed INTEGER DEFAULT 0,
                    items_created INTEGER DEFAULT 0,
                    items_updated INTEGER DEFAULT 0,
                    errors TEXT,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            // 11. Create published_drafts table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS published_drafts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_id INTEGER NOT NULL,
                    project_id INTEGER NOT NULL,
                    rewrite_id INTEGER NOT NULL,
                    wp_post_id INTEGER NOT NULL,
                    wp_draft_id INTEGER NOT NULL,
                    publish_mode TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                    FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE CASCADE,
                    FOREIGN KEY(rewrite_id) REFERENCES rewrites(id) ON DELETE CASCADE
                )
            `);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_published_drafts_project_id ON published_drafts(project_id)`);

            // 12. Refactor or Create jobs table
            const tableExists = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='jobs'").get();
            
            if (!tableExists) {
                console.log('Creating jobs table...');
                this.db.exec(`
                    CREATE TABLE jobs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        site_id INTEGER NOT NULL,
                        project_id INTEGER,
                        type TEXT NOT NULL DEFAULT 'REWRITE',
                        status TEXT NOT NULL,
                        priority TEXT NOT NULL DEFAULT 'NORMAL',
                        prompt TEXT,
                        audit_prompt_snapshot TEXT,
                        rewrite_prompt_snapshot TEXT,
                        metadata TEXT,
                        error TEXT,
                        created_at DATETIME NOT NULL,
                        updated_at DATETIME NOT NULL,
                        FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                        FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE SET NULL
                    )
                `);
                
                this.db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
                    CREATE INDEX IF NOT EXISTS idx_jobs_site_id ON jobs(site_id);
                    CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON jobs(project_id);
                `);
            } else {
                const columns = this.db.prepare("PRAGMA table_info(jobs)").all();
                const hasSiteId = columns.some(c => c.name === 'site_id');
                const hasMetadata = columns.some(c => c.name === 'metadata');
                
                if (!hasSiteId || !hasMetadata) {
                    console.log('Migrating jobs table to multi-site schema...');
                    
                    const now = new Date().toISOString();
                    this.db.prepare(`
                        INSERT OR IGNORE INTO sites (id, name, domain, created_at) 
                        VALUES (1, 'Default Site', 'example.com', ?)
                    `).run(now);

                    this.db.prepare(`
                        INSERT OR IGNORE INTO site_settings (site_id, version, updated_at, created_at)
                        VALUES (1, 1, ?, ?)
                    `).run(now, now);

                    this.db.exec(`
                        CREATE TABLE jobs_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            site_id INTEGER NOT NULL,
                            project_id INTEGER,
                            type TEXT NOT NULL DEFAULT 'REWRITE',
                            status TEXT NOT NULL,
                            priority TEXT NOT NULL DEFAULT 'NORMAL',
                            prompt TEXT,
                            audit_prompt_snapshot TEXT,
                            rewrite_prompt_snapshot TEXT,
                            metadata TEXT,
                            error TEXT,
                            created_at DATETIME NOT NULL,
                            updated_at DATETIME NOT NULL,
                            FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
                            FOREIGN KEY(project_id) REFERENCES content_projects(id) ON DELETE SET NULL
                        )
                    `);

                    const existingJobs = this.db.prepare("SELECT * FROM jobs").all();
                    for (const job of existingJobs) {
                        const wpPostId = job.wp_post_id;
                        const prompt = job.prompt;
                        const status = job.status;
                        const error = job.error;
                        const createdAt = job.created_at || now;
                        const updatedAt = job.updated_at || now;
                        const metadata = job.metadata || null;
                        const siteId = job.site_id || 1;

                        let projectId = null;
                        if (wpPostId) {
                            const projectInfo = this.db.prepare(`
                                INSERT OR IGNORE INTO content_projects (site_id, wp_post_id, status, created_at, updated_at)
                                VALUES (?, ?, 'CREATED', ?, ?)
                            `).run(siteId, wpPostId, createdAt, updatedAt);
                            
                            if (projectInfo.changes > 0) {
                                projectId = projectInfo.lastInsertRowid;
                            } else {
                                const existingProj = this.db.prepare("SELECT id FROM content_projects WHERE site_id = ? AND wp_post_id = ?").get(siteId, wpPostId);
                                if (existingProj) projectId = existingProj.id;
                            }
                        }

                        this.db.prepare(`
                            INSERT INTO jobs_new (id, site_id, project_id, status, prompt, error, metadata, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).run(job.id, siteId, projectId, status, prompt, error, metadata, createdAt, updatedAt);
                    }

                    this.db.exec("DROP TABLE jobs");
                    this.db.exec("ALTER TABLE jobs_new RENAME TO jobs");
                    
                    this.db.exec(`
                        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
                        CREATE INDEX IF NOT EXISTS idx_jobs_site_id ON jobs(site_id);
                        CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON jobs(project_id);
                    `);
                }
            }

            // Standard tables (worker_state, incidents)
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS worker_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    state TEXT NOT NULL,
                    reason TEXT,
                    last_seen DATETIME NOT NULL,
                    recovery_attempts INTEGER DEFAULT 0,
                    updated_at DATETIME NOT NULL
                )
            `);
            
            this.db.exec(`
                INSERT OR IGNORE INTO worker_state (id, state, reason, last_seen, recovery_attempts, updated_at)
                VALUES (1, 'STARTING', 'initialization', datetime('now'), 0, datetime('now'))
            `);

            this.db.exec(`
                CREATE TABLE IF NOT EXISTS incidents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT,
                    created_at DATETIME NOT NULL,
                    resolved_at DATETIME
                )
            `);

            this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
                CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
            `);

        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }
}

module.exports = Migrations;
