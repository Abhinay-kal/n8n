class WordPressRepository {
    constructor(db) {
        this.db = db;
    }

    async upsertAuthor(siteId, wpAuthorId, name) {
        const stmt = this.db.prepare(`
            INSERT INTO authors (site_id, wp_author_id, name)
            VALUES (?, ?, ?)
            ON CONFLICT(site_id, wp_author_id) DO UPDATE SET
                name = excluded.name
        `);
        const info = stmt.run(siteId, wpAuthorId, name);
        
        // Return local ID
        if (info.lastInsertRowid > 0) return info.lastInsertRowid;
        const row = this.db.prepare('SELECT id FROM authors WHERE site_id = ? AND wp_author_id = ?').get(siteId, wpAuthorId);
        return row.id;
    }

    async upsertCategory(siteId, wpCategoryId, name, slug) {
        const stmt = this.db.prepare(`
            INSERT INTO categories (site_id, wp_category_id, name, slug)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(site_id, wp_category_id) DO UPDATE SET
                name = excluded.name,
                slug = excluded.slug
        `);
        stmt.run(siteId, wpCategoryId, name, slug);
    }

    async upsertTag(siteId, wpTagId, name, slug) {
        const stmt = this.db.prepare(`
            INSERT INTO tags (site_id, wp_tag_id, name, slug)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(site_id, wp_tag_id) DO UPDATE SET
                name = excluded.name,
                slug = excluded.slug
        `);
        stmt.run(siteId, wpTagId, name, slug);
    }

    async upsertPost(siteId, data) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO posts (
                site_id, wp_post_id, title, slug, status, modified, 
                content, excerpt, author_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(site_id, wp_post_id) DO UPDATE SET
                title = excluded.title,
                slug = excluded.slug,
                status = excluded.status,
                modified = excluded.modified,
                content = excluded.content,
                excerpt = excluded.excerpt,
                author_id = excluded.author_id,
                updated_at = excluded.updated_at
        `);
        
        const info = stmt.run(
            siteId,
            data.wp_post_id,
            data.title,
            data.slug,
            data.status,
            data.modified,
            data.content || null,
            data.excerpt || null,
            data.author_id || null,
            now,
            now
        );
        
        return info.changes > 0;
    }

    async startSyncRun(siteId) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO sync_runs (site_id, started_at, status)
            VALUES (?, ?, ?)
        `);
        const info = stmt.run(siteId, now, 'RUNNING');
        return info.lastInsertRowid;
    }

    async updateSyncRun(syncId, data) {
        const columns = [];
        const values = [];
        
        for (const [key, val] of Object.entries(data)) {
            columns.push(`${key} = ?`);
            values.push(val);
        }

        if (columns.length === 0) return;

        values.push(syncId);
        const stmt = this.db.prepare(`
            UPDATE sync_runs SET ${columns.join(', ')} WHERE id = ?
        `);
        stmt.run(...values);
    }

    async getPostsBySiteId(siteId, params = {}) {
        const stmt = this.db.prepare('SELECT * FROM posts WHERE site_id = ? ORDER BY modified DESC');
        return stmt.all(siteId);
    }

    async getPostByWpId(siteId, wpPostId) {
        const stmt = this.db.prepare('SELECT * FROM posts WHERE site_id = ? AND wp_post_id = ?');
        return stmt.get(siteId, wpPostId);
    }

    async getCategoriesBySiteId(siteId) {
        const stmt = this.db.prepare('SELECT * FROM categories WHERE site_id = ?');
        return stmt.all(siteId);
    }

    async getTagsBySiteId(siteId) {
        const stmt = this.db.prepare('SELECT * FROM tags WHERE site_id = ?');
        return stmt.all(siteId);
    }

    async getAuthorsBySiteId(siteId) {
        const stmt = this.db.prepare('SELECT * FROM authors WHERE site_id = ?');
        return stmt.all(siteId);
    }
}

module.exports = { WordPressRepository };
