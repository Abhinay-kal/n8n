const express = require('express');

function createAuditRoutes({ projectService, jobService, logger }) {
    const router = express.Router();

    // POST /projects/:id/audit - Create a new audit job
    router.post('/projects/:id/audit', async (req, res) => {
        try {
            const project = await projectService.projectRepository.getProjectById(req.params.id);
            if (!project) {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }

            const job = await jobService.createJob({
                siteId: project.siteId,
                wpPostId: project.wpPostId,
                type: 'AUDIT',
                priority: req.body.priority || 'NORMAL'
            });

            return res.status(201).json({
                success: true,
                jobId: job.id,
                status: job.status
            });
        } catch (error) {
            logger.error({ event: 'AUDIT_CREATE_ROUTE_ERROR', project_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /projects/:id/audits - Get audit history for a project
    router.get('/projects/:id/audits', async (req, res) => {
        try {
            const audits = await projectService.projectRepository.getAuditsByProjectId(req.params.id);
            return res.json({ success: true, audits });
        } catch (error) {
            logger.error({ event: 'PROJECT_AUDITS_ROUTE_ERROR', project_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /audits/:id - Get specific audit details
    router.get('/audits/:id', async (req, res) => {
        try {
            const audit = await projectService.projectRepository.getAuditById(req.params.id);
            if (!audit) {
                return res.status(404).json({ success: false, error: 'Audit not found' });
            }
            return res.json({ success: true, audit });
        } catch (error) {
            logger.error({ event: 'AUDIT_GET_ROUTE_ERROR', audit_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createAuditRoutes };
