const { Site } = require('../models/Site');

class SiteRepository {
    constructor(db) {
        this.db = db;
    }

    async createSite(data) {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO sites (name, domain, wp_url, wp_username, wp_application_password, active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            data.name, 
            data.domain, 
            data.wpUrl || null, 
            data.wpUsername || null, 
            data.wpApplicationPassword || null, 
            data.active !== undefined ? (data.active ? 1 : 0) : 1, 
            now
        );

        const siteId = info.lastInsertRowid;
        
        // Initialize settings
        this.db.prepare(`
            INSERT INTO site_settings (site_id, version, country, language, target_location, updated_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            siteId,
            1, // version
            data.country || null,
            data.language || 'English',
            data.targetLocation || null,
            now,
            now
        );

        return this.getSiteById(siteId);
    }

    async getSiteById(id) {
        const stmt = this.db.prepare('SELECT * FROM sites WHERE id = ?');
        const row = stmt.get(id);
        return row ? new Site(row) : null;
    }

    async getSiteByDomain(domain) {
        const stmt = this.db.prepare('SELECT * FROM sites WHERE domain = ?');
        const row = stmt.get(domain);
        return row ? new Site(row) : null;
    }

    async updateSite(id, data) {
        const columns = [];
        const values = [];
        
        const allowedFields = ['name', 'domain', 'wp_url', 'wp_username', 'wp_application_password'];
        
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                columns.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (columns.length === 0) return this.getSiteById(id);

        values.push(id);
        const stmt = this.db.prepare(`
            UPDATE sites SET ${columns.join(', ')} WHERE id = ?
        `);
        stmt.run(...values);
        
        return this.getSiteById(id);
    }

    async disableSite(id) {
        const stmt = this.db.prepare('UPDATE sites SET active = 0 WHERE id = ?');
        stmt.run(id);
        return this.getSiteById(id);
    }

    async getSiteSettings(siteId) {
        const stmt = this.db.prepare('SELECT * FROM site_settings WHERE site_id = ?');
        return stmt.get(siteId);
    }

    async updateSiteSettings(siteId, data) {
        const columns = [];
        const values = [];
        
        const allowedFields = ['audit_prompt', 'rewrite_prompt', 'country', 'language', 'target_location'];
        
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                columns.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (columns.length === 0) return this.getSiteSettings(siteId);

        // Increment version and set updated_at
        columns.push(`version = version + 1`);
        columns.push(`updated_at = ?`);
        values.push(new Date().toISOString());

        values.push(siteId);
        const stmt = this.db.prepare(`
            UPDATE site_settings SET ${columns.join(', ')} WHERE site_id = ?
        `);
        stmt.run(...values);
        
        return this.getSiteSettings(siteId);
    }

    async getAllSites() {
        const stmt = this.db.prepare('SELECT * FROM sites ORDER BY name ASC');
        return stmt.all().map(row => new Site(row));
    }

    async deleteSite(id) {
        // Cascading delete handled by SQLite schema
        const stmt = this.db.prepare('DELETE FROM sites WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
}

module.exports = { SiteRepository };
