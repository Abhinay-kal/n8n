const express = require('express');

function createHealthRouter({ worker, logger }) {
    const router = express.Router();

    router.get('/health', async (req, res) => {
        try {
            const healthy = await worker.isHealthy();

            if (healthy) {
                return res.json({ status: 'healthy' });
            }

            logger.warn('health degraded');
            return res.status(503).json({ status: 'degraded' });
        } catch (error) {
            logger.error('health check failed', { error: error.message });
            return res.status(503).json({ status: 'broken' });
        }
    });

    return router;
}

module.exports = createHealthRouter;
