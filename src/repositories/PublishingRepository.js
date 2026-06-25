class PublishingRepository {
    constructor(db) {
        this.db = db;
    }

    async createPublishedDraft({ siteId, projectId, rewriteId, wpPostId, wpDraftId, publishMode, status }) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO published_drafts (site_id, project_id, rewrite_id, wp_post_id, wp_draft_id, publish_mode, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(siteId, projectId, rewriteId, wpPostId, wpDraftId, publishMode, status, now);
        return this.getPublishedDraftById(info.lastInsertRowid);
    }

    async getPublishedDraftById(id) {
        const stmt = this.db.prepare('SELECT * FROM published_drafts WHERE id = ?');
        const row = stmt.get(id);
        return row || null;
    }

    async getPublishedDraftsByProjectId(projectId) {
        const stmt = this.db.prepare('SELECT * FROM published_drafts WHERE project_id = ? ORDER BY created_at DESC, id DESC');
        return stmt.all(projectId);
    }
}

module.exports = { PublishingRepository };
