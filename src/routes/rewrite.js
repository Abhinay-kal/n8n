const express = require('express');

function createRewriteRouter({ worker, logger }) {
    const router = express.Router();

    router.post('/rewrite', async (req, res) => {
        logger.info('request start');

        try {
            const prompt = req.body?.prompt;

            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing prompt'
                });
            }

            const response = await worker.rewrite(prompt);

            logger.info('request finish', { success: true });
            return res.json({
                success: true,
                response
            });
        } catch (error) {
            logger.error('request error', { error: error.message });

            if (error.message === 'Authentication required') {
                return res.status(401).json({
                    success: false,
                    error: error.message
                });
            }

            if (error.message === 'worker_unavailable') {
                return res.status(503).json({
                    success: false,
                    error: 'worker_unavailable'
                });
            }

            if (error.message === 'response_timeout') {
                return res.status(504).json({
                    success: false,
                    error: 'response_timeout'
                });
            }

            return res.status(500).json({
                success: false,
                error: error.message || 'unknown_error'
            });
        }
    });

    return router;
}

module.exports = createRewriteRouter;
