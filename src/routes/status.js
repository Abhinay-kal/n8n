const express = require('express');

function createStatusRouter({ worker, logger }) {
    const router = express.Router();

    router.get('/status', async (req, res) => {
        try {
            const snapshot = worker.getStatusSnapshot();

            return res.json({
                browser: snapshot.browser,
                page: snapshot.page,
                session: snapshot.session,
                queue: snapshot.queue,
                state: snapshot.state
            });
        } catch (error) {
            logger.error('status check failed', { error: error.message });
            return res.status(500).json({
                browser: false,
                page: false,
                session: 'broken',
                queue: worker.getQueueSize(),
                state: 'BROKEN'
            });
        }
    });

    return router;
}

module.exports = createStatusRouter;
