const express = require('express');

function createJobRoutes({ jobService, logRepository, logger }) {
    const router = express.Router();

    // GET /jobs/:id - Detailed job status and summary logs
    router.get('/jobs/:id', async (req, res) => {
        try {
            const job = await jobService.getJobById(req.params.id);
            if (!job) {
                return res.status(404).json({ success: false, error: 'Job not found' });
            }
            
            const logs = await logRepository.getLogsByJobId(req.params.id);
            
            return res.json({
                success: true,
                job,
                latest_logs: logs.slice(0, 5),
                log_count: logs.length
            });
        } catch (error) {
            logger.error({ event: 'JOB_GET_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /jobs/:id/logs - Full execution history for a job
    router.get('/jobs/:id/logs', async (req, res) => {
        try {
            const logs = await logRepository.getLogsByJobId(req.params.id);
            return res.json({
                success: true,
                logs
            });
        } catch (error) {
            logger.error({ event: 'JOB_LOGS_ROUTE_ERROR', error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createJobRoutes };
