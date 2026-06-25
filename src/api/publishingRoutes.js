const express = require('express');

function createPublishingRoutes({ publishingService, logger }) {
    const router = express.Router();

    // POST /projects/:id/publish - Create a draft or submit for review
    router.post('/projects/:id/publish', async (req, res) => {
        try {
            const { rewriteId, mode } = req.body;
            if (!rewriteId) {
                return res.status(400).json({ success: false, error: 'rewriteId is required' });
            }

            const result = await publishingService.publishToWordPress(req.params.id, { rewriteId, mode });
            return res.json({ success: true, ...result });
        } catch (error) {
            logger.error({ event: 'PUBLISH_ROUTE_ERROR', project_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /projects/:id/published - Get draft history for a project
    router.get('/projects/:id/published', async (req, res) => {
        try {
            const history = await publishingService.getPublishingHistory(req.params.id);
            return res.json({ success: true, history });
        } catch (error) {
            logger.error({ event: 'PROJECT_PUBLISHED_HISTORY_ERROR', project_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /published/:id - Get specific publishing details
    router.get('/published/:id', async (req, res) => {
        try {
            const details = await publishingService.publishingRepository.getPublishedDraftById(req.params.id);
            if (!details) {
                return res.status(404).json({ success: false, error: 'Publishing record not found' });
            }
            return res.json({ success: true, details });
        } catch (error) {
            logger.error({ event: 'PUBLISHING_DETAILS_ERROR', id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createPublishingRoutes };
