const express = require('express');

/**
 * @param {Object} deps
 * @param {import('../monitor/SessionMonitor').SessionMonitor} deps.sessionMonitor
 * @param {import('../services/QueueService').QueueService} deps.queueService
 * @param {import('../services/MetricsService').MetricsService} deps.metricsService
 * @param {Object} deps.logger
 * @returns {import('express').Router}
 */
function createStatusRoutes({ sessionMonitor, queueService, metricsService, logger, stateMachine, browserManager, claudeManager, recoveryManager }) {
    const router = express.Router();

    router.get('/status', (req, res) => {
        try {
            const monitorStatus = sessionMonitor.getStatus();
            const metrics = metricsService.getSnapshot();
            const state = stateMachine.getState();
            
            const snapshot = {
                state: state,
                uptime: Math.round(metrics.uptimeMs / 1000),
                resources: metrics.resources,
                database: {
                    connected: true, // If we reached here, DB is at least alive via stateMachine
                    path: 'jobs.sqlite'
                },
                browser: {
                    healthy: Boolean(browserManager.context && !browserManager.contextClosed),
                    pageHealthy: Boolean(browserManager.claudePage && !browserManager.pageClosed),
                    profilePath: '[REDACTED]'
                },
                session: {
                    healthy: claudeManager.initialized && state !== 'BROKEN',
                    lastCheck: monitorStatus.lastCheck
                },
                worker: {
                    state: state,
                    active: state !== 'BROKEN' && state !== 'STARTING',
                    history: stateMachine.getHistory()
                },
                queue: {
                    size: queueService.size,
                    paused: queueService.paused,
                    active: !queueService.paused && queueService.size > 0
                },
                recovery: {
                    inProgress: state === 'RECOVERING',
                    attempts: recoveryManager.recoveryAttempts,
                    maxAttempts: recoveryManager.MAX_RECOVERY_ATTEMPTS,
                    lastAttempt: monitorStatus.lastRecovery,
                    totalRecoveries: metrics.recoveries,
                    failedRecoveries: metrics.failed_recoveries
                },
                metrics: {
                    totalRequests: metrics.recoveries + metrics.failed_recoveries, // Placeholder for actual jobs if available
                    successRate: ((metrics.recoveries / (metrics.recoveries + metrics.failed_recoveries || 1)) * 100).toFixed(1) + '%',
                    incidents: {
                        browserRestarts: metrics.browser_restarts,
                        pageRestarts: metrics.page_restarts,
                        sessionExpirations: metrics.session_expirations,
                        rateLimits: metrics.rate_limits,
                        captchas: metrics.captchas,
                        queueFailures: metrics.queue_failures,
                        startupFailures: metrics.startup_failures
                    }
                }
            };

            return res.json(snapshot);
        } catch (error) {
            logger.error({ event: 'STATUS_ROUTE_ERROR', error: error.message });
            return res.status(500).json({
                state: 'BROKEN',
                error: 'Internal status fetch failed'
            });
        }
    });

    return router;
}

module.exports = { createStatusRoutes };