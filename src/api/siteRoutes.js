const express = require('express');

function createSiteRoutes({ siteService, jobService, logger }) {
    const router = express.Router();

    const isValidDomain = (domain) => {
        return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain) && domain.length <= 255;
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return url.length <= 2048;
        } catch (_) {
            return false;
        }
    };

    // Middleware to validate site creation payload
    const validateSiteData = (req, res, next) => {
        const { name, domain, wp_url } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Site name is required and must not be empty' });
        }
        if (name.length > 255) {
            return res.status(400).json({ success: false, error: 'Site name exceeds maximum length of 255' });
        }
        
        if (!domain || typeof domain !== 'string' || domain.trim() === '') {
            return res.status(400).json({ success: false, error: 'Site domain is required and must not be empty' });
        }
        if (!isValidDomain(domain)) {
            return res.status(400).json({ success: false, error: 'Invalid domain format or length' });
        }

        if (wp_url && !isValidUrl(wp_url)) {
            return res.status(400).json({ success: false, error: 'Invalid URL format or length for wp_url' });
        }

        // WP credentials are now optional during infrastructure setup.
        // But if they are provided, they must be complete.
        const { wp_username, wp_application_password } = req.body;
        
        const hasAnyWpCreds = wp_url || wp_username || wp_application_password;
        if (hasAnyWpCreds) {
            if (!wp_url || !wp_username || !wp_application_password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'WordPress credentials (wp_url, wp_username, wp_application_password) must be provided together if at all.' 
                });
            }
        }

        next();
    };

    // Partial validation for updates
    const validateUpdateData = (req, res, next) => {
        const { name, domain, wp_url } = req.body;
        
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim() === '') return res.status(400).json({ success: false, error: 'Site name must not be empty' });
            if (name.length > 255) return res.status(400).json({ success: false, error: 'Site name exceeds maximum length' });
        }

        if (domain !== undefined) {
            if (typeof domain !== 'string' || domain.trim() === '') return res.status(400).json({ success: false, error: 'Domain must not be empty' });
            if (!isValidDomain(domain)) return res.status(400).json({ success: false, error: 'Invalid domain format' });
        }

        if (wp_url !== undefined && !isValidUrl(wp_url)) {
            return res.status(400).json({ success: false, error: 'Invalid URL format' });
        }

        // Must still provide complete creds if updating them
        const { wp_username, wp_application_password } = req.body;
        const hasAnyWpCreds = wp_url || wp_username || wp_application_password;
        if (hasAnyWpCreds) {
            if (!wp_url || !wp_username || !wp_application_password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'If updating WordPress credentials, wp_url, wp_username, and wp_application_password must be provided together.' 
                });
            }
        }

        next();
    };

    router.post('/sites', validateSiteData, async (req, res) => {
        try {
            const data = {
                name: req.body.name,
                domain: req.body.domain,
                wpUrl: req.body.wp_url,
                wpUsername: req.body.wp_username,
                wpApplicationPassword: req.body.wp_application_password,
                country: req.body.country,
                language: req.body.language,
                targetLocation: req.body.target_location
            };

            const site = await siteService.createSite(data);
            return res.status(201).json({ success: true, site: site.toJSON() });
        } catch (error) {
            logger.error({ event: 'SITE_CREATION_ROUTE_ERROR', error: error.message });
            if (error.message.includes('Encryption unavailable') || error.message.includes('already in use')) {
                return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.get('/sites', async (req, res) => {
        try {
            const sites = await siteService.getAllSites();
            return res.json({ success: true, sites: sites.map(s => s.toJSON()) });
        } catch (error) {
            logger.error({ event: 'SITE_LIST_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.get('/sites/:id', async (req, res) => {
        try {
            const site = await siteService.getSite(req.params.id);
            if (!site) {
                return res.status(404).json({ success: false, error: 'Site not found' });
            }
            return res.json({ success: true, site: site.toJSON() });
        } catch (error) {
            logger.error({ event: 'SITE_GET_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.put('/sites/:id', validateUpdateData, async (req, res) => {
        try {
            const data = {};
            if (req.body.name !== undefined) data.name = req.body.name;
            if (req.body.domain !== undefined) data.domain = req.body.domain;
            if (req.body.wp_url !== undefined) data.wp_url = req.body.wp_url;
            if (req.body.wp_username !== undefined) data.wp_username = req.body.wp_username;
            if (req.body.wp_application_password !== undefined) data.wp_application_password = req.body.wp_application_password;

            const site = await siteService.updateSite(req.params.id, data);
            if (!site) {
                return res.status(404).json({ success: false, error: 'Site not found' });
            }
            return res.json({ success: true, site: site.toJSON() });
        } catch (error) {
            logger.error({ event: 'SITE_UPDATE_ROUTE_ERROR', error: error.message });
            if (error.message.includes('Encryption unavailable') || error.message.includes('already in use')) {
                return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.put('/sites/:id/disable', async (req, res) => {
        try {
            const site = await siteService.disableSite(req.params.id);
            if (!site) {
                return res.status(404).json({ success: false, error: 'Site not found' });
            }
            return res.json({ success: true, site: site.toJSON() });
        } catch (error) {
            logger.error({ event: 'SITE_DISABLE_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.get('/sites/:id/settings', async (req, res) => {
        try {
            const settings = await siteService.getSiteSettings(req.params.id);
            if (!settings) {
                return res.status(404).json({ success: false, error: 'Site settings not found' });
            }
            return res.json({ success: true, settings });
        } catch (error) {
            logger.error({ event: 'SITE_SETTINGS_GET_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.put('/sites/:id/settings', async (req, res) => {
        try {
            const settings = await siteService.updateSiteSettings(req.params.id, req.body);
            if (!settings) {
                return res.status(404).json({ success: false, error: 'Site not found' });
            }
            return res.json({ success: true, settings });
        } catch (error) {
            logger.error({ event: 'SITE_SETTINGS_UPDATE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.post('/sites/:id/jobs', async (req, res) => {
        try {
            const { wp_post_id, prompt, type, priority } = req.body;
            const siteId = req.params.id;

            const job = await jobService.createJob({ 
                siteId, 
                wpPostId: wp_post_id, 
                prompt, 
                type, 
                priority 
            });

            return res.status(201).json({
                success: true,
                projectId: job.project_id,
                jobId: job.id,
                status: job.status
            });
        } catch (error) {
            logger.error({ event: 'SITE_JOB_CREATE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.get('/sites/:id/jobs', async (req, res) => {
        try {
            const jobs = await jobService.getJobsBySiteId(req.params.id);
            return res.json({
                success: true,
                jobs: jobs.map(j => ({
                    id: j.id,
                    projectId: j.project_id,
                    type: j.type,
                    status: j.status,
                    priority: j.priority,
                    createdAt: j.created_at,
                    updatedAt: j.updated_at
                }))
            });
        } catch (error) {
            logger.error({ event: 'SITE_JOBS_GET_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createSiteRoutes };
