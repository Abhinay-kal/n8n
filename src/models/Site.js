class Site {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.domain = data.domain;
        this.wpUrl = data.wp_url;
        this.wpUsername = data.wp_username;
        this.wpApplicationPassword = data.wp_application_password;
        this.active = Boolean(data.active);
        this.createdAt = data.created_at;
    }

    /**
     * Redacts sensitive credentials for API responses.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            domain: this.domain,
            wpUrl: this.wpUrl,
            wpUsername: this.wpUsername,
            wpApplicationPassword: '[REDACTED]',
            active: this.active,
            createdAt: this.createdAt
        };
    }
}

module.exports = { Site };
