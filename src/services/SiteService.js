const Encryption = require('../utils/encryption');

class SiteService {
    constructor({ siteRepository, logger, config }) {
        this.siteRepository = siteRepository;
        this.logger = logger;
        this.encryption = new Encryption(process.env.APP_SECRET);
    }

    async createSite(data) {
        const siteData = { ...data };
        
        // Duplicate domain check
        if (siteData.domain) {
            const existing = await this.siteRepository.getSiteByDomain(siteData.domain);
            if (existing) {
                throw new Error(`Domain ${siteData.domain} is already in use`);
            }
        }
        
        if (siteData.wpApplicationPassword || siteData.wpUsername || siteData.wpUrl) {
            if (!this.encryption.enabled) {
                throw new Error('Encryption unavailable. APP_SECRET not configured. Credentials cannot be securely stored.');
            }
            if (siteData.wpApplicationPassword) {
                try {
                    siteData.wpApplicationPassword = this.encryption.encrypt(siteData.wpApplicationPassword);
                } catch (err) {
                    this.logger.error({ event: 'SITE_CREATION_ENCRYPTION_FAILED', error: err.message });
                    throw new Error('Failed to secure credentials. Please check encryption configuration.');
                }
            }
        }

        const site = await this.siteRepository.createSite(siteData);
        this.logger.info({ event: 'SITE_CREATED', site_id: site.id, domain: site.domain });
        return site;
    }

    async updateSite(id, data) {
        const siteData = { ...data };

        if (siteData.domain) {
            const existing = await this.siteRepository.getSiteByDomain(siteData.domain);
            if (existing && existing.id !== Number(id)) {
                throw new Error(`Domain ${siteData.domain} is already in use`);
            }
        }

        if (siteData.wp_application_password || siteData.wp_username || siteData.wp_url) {
            if (!this.encryption.enabled) {
                throw new Error('Encryption unavailable. APP_SECRET not configured. Credentials cannot be securely stored.');
            }
            if (siteData.wp_application_password) {
                try {
                    siteData.wp_application_password = this.encryption.encrypt(siteData.wp_application_password);
                } catch (err) {
                    this.logger.error({ event: 'SITE_UPDATE_ENCRYPTION_FAILED', error: err.message });
                    throw new Error('Failed to secure credentials. Please check encryption configuration.');
                }
            }
        }

        const site = await this.siteRepository.updateSite(id, siteData);
        this.logger.info({ event: 'SITE_UPDATED', site_id: id });
        return site;
    }

    async disableSite(id) {
        const site = await this.siteRepository.disableSite(id);
        this.logger.info({ event: 'SITE_DISABLED', site_id: id });
        return site;
    }

    async getSite(id) {
        return this.siteRepository.getSiteById(id);
    }

    async getSiteSettings(id) {
        return this.siteRepository.getSiteSettings(id);
    }

    async updateSiteSettings(id, data) {
        const settings = await this.siteRepository.updateSiteSettings(id, data);
        this.logger.info({ event: 'SITE_SETTINGS_UPDATED', site_id: id });
        return settings;
    }

    async getAllSites() {
        return this.siteRepository.getAllSites();
    }

    async getDecryptedCredentials(id) {
        const site = await this.getSite(id);
        if (!site) return null;

        let password = null;
        if (site.wpApplicationPassword) {
            try {
                password = this.encryption.decrypt(site.wpApplicationPassword);
            } catch (err) {
                this.logger.error({ event: 'CREDENTIAL_DECRYPTION_FAILED', site_id: id, error: err.message });
                throw new Error('Failed to decrypt site credentials.');
            }
        }

        return {
            wpUrl: site.wpUrl,
            wpUsername: site.wpUsername,
            wpApplicationPassword: password
        };
    }
}

module.exports = { SiteService };
