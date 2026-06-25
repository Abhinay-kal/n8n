const express = require('express');

function createRewriteRoutes({ projectService, jobService, logger }) {
    const router = express.Router();

    // POST /projects/:id/rewrite - Create a new rewrite job
    router.post('/projects/:id/rewrite', async (req, res) => {
        try {
            const project = await projectService.projectRepository.getProjectById(req.params.id);
            if (!project) {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }

            const job = await jobService.createJob({
                siteId: project.siteId,
                wpPostId: project.wpPostId,
                type: 'REWRITE',
                priority: req.body.priority || 'NORMAL'
            });

            return res.status(201).json({
                success: true,
                jobId: job.id,
                status: job.status
            });
        } catch (error) {
            logger.error({ event: 'REWRITE_CREATE_ROUTE_ERROR', project_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /projects/:id/rewrites - Get rewrite history for a project
    router.get('/projects/:id/rewrites', async (req, res) => {
        try {
            const rewrites = await projectService.projectRepository.getRewritesByProjectId(req.params.id);
            return res.json({ success: true, rewrites });
        } catch (error) {
            logger.error({ event: 'PROJECT_REWRITES_ROUTE_ERROR', project_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /rewrites/:id - Get specific rewrite details
    router.get('/rewrites/:id', async (req, res) => {
        try {
            const rewrite = await projectService.projectRepository.getRewriteById(req.params.id);
            if (!rewrite) {
                return res.status(404).json({ success: false, error: 'Rewrite not found' });
            }
            return res.json({ success: true, rewrite });
        } catch (error) {
            logger.error({ event: 'REWRITE_GET_ROUTE_ERROR', rewrite_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createRewriteRoutes };
