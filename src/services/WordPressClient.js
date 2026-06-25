/**
 * WordPressClient
 * 
 * Encapsulates all WordPress REST API interactions.
 * Uses Basic Auth (Username + Application Password).
 */
class WordPressClient {
    constructor({ url, username, applicationPassword, logger }) {
        this.url = url.replace(/\/$/, ''); // Remove trailing slash
        this.username = username;
        this.applicationPassword = applicationPassword;
        this.logger = logger;
        this.apiUrl = `${this.url}/wp-json/wp/v2`;
    }

    _getHeaders() {
        const auth = Buffer.from(`${this.username}:${this.applicationPassword}`).toString('base64');
        return {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'User-Agent': 'OptimizationPlatform/1.0'
        };
    }

    async _request(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = { ...this._getHeaders(), ...options.headers };
        
        this.logger.info({ event: 'WP_API_FETCH_START', url, method: options.method || 'GET' });
        try {
            const response = await fetch(url, { ...options, headers });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || response.statusText;
                this.logger.error({ 
                    event: 'WP_API_ERROR', 
                    endpoint, 
                    status: response.status, 
                    message 
                });
                throw new Error(`WordPress API Error (${response.status}): ${message}`);
            }

            return {
                data: await response.json(),
                headers: response.headers
            };
        } catch (error) {
            this.logger.error({ 
                event: 'WP_API_REQUEST_FAILED', 
                endpoint, 
                error: error.message 
            });
            throw error;
        }
    }

    async testConnection() {
        // Simple call to validate credentials
        const result = await this._request('/users/me');
        
        // Also try to get WP version from headers if possible or just return success
        return {
            success: true,
            user: result.data.slug || result.data.name
        };
    }

    async getPosts(params = {}) {
        const query = new URLSearchParams({
            per_page: 100,
            status: 'publish,draft,private',
            ...params
        }).toString();
        
        const result = await this._request(`/posts?${query}`);
        return {
            posts: result.data,
            total: parseInt(result.headers.get('X-WP-Total') || result.data.length),
            totalPages: parseInt(result.headers.get('X-WP-TotalPages') || 1)
        };
    }

    async getPages(params = {}) {
        const query = new URLSearchParams({
            per_page: 100,
            ...params
        }).toString();
        
        const result = await this._request(`/pages?${query}`);
        return result.data;
    }

    async getCategories() {
        const result = await this._request('/categories?per_page=100');
        return result.data;
    }

    async getTags() {
        const result = await this._request('/tags?per_page=100');
        return result.data;
    }

    async getAuthors() {
        const result = await this._request('/users?per_page=100');
        return result.data;
    }

    async createDraft(data) {
        const result = await this._request('/posts', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                status: 'draft'
            })
        });
        return result.data;
    }

    async updateDraft(wpPostId, data) {
        const result = await this._request(`/posts/${wpPostId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result.data;
    }

    async createPendingReview(wpPostId, data) {
        const result = await this._request(`/posts/${wpPostId}`, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                status: 'pending'
            })
        });
        return result.data;
    }
}

module.exports = WordPressClient;
