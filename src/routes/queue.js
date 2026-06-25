const express = require('express');

function createQueueRouter({ jobService, logger }) {
    const router = express.Router();

    // GET /queue - Returns summary of job statuses
    router.get('/queue', async (req, res) => {
        try {
            const summary = await jobService.getQueueSummary();
            return res.json({
                success: true,
                ...summary
            });
        } catch (error) {
            logger.error({ event: 'QUEUE_SUMMARY_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /queue/stats - Returns performance metrics
    router.get('/queue/stats', async (req, res) => {
        try {
            const stats = await jobService.getQueueStats();
            return res.json({
                success: true,
                ...stats
            });
        } catch (error) {
            logger.error({ event: 'QUEUE_STATS_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /sites/:id/queue - Returns site-specific queue
    router.get('/sites/:id/queue', async (req, res) => {
        try {
            const siteId = parseInt(req.params.id);
            if (isNaN(siteId)) {
                return res.status(400).json({ success: false, error: 'Invalid site ID' });
            }
            const queue = await jobService.getSiteQueue(siteId);
            return res.json({
                success: true,
                ...queue
            });
        } catch (error) {
            logger.error({ event: 'SITE_QUEUE_ERROR', site_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
}

module.exports = createQueueRouter;
