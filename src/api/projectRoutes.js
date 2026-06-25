const express = require('express');

function createProjectRoutes({ projectService, logger }) {
    const router = express.Router();

    router.get('/projects/:id', async (req, res) => {
        try {
            const details = await projectService.getProjectDetails(req.params.id);
            if (!details) {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }
            return res.json({ success: true, ...details });
        } catch (error) {
            logger.error({ event: 'PROJECT_GET_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    router.get('/projects/:id/history', async (req, res) => {
        try {
            const history = await projectService.getProjectHistory(req.params.id);
            return res.json({ success: true, history });
        } catch (error) {
            logger.error({ event: 'PROJECT_HISTORY_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createProjectRoutes };
