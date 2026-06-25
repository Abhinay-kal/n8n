const { BootstrapManager } = require('./bootstrap/BootstrapManager');
const { createApp } = require('./server');

async function main() {
    const bootstrap = new BootstrapManager();
    
    try {
        const { config, services, logger } = await bootstrap.run();
        
        // Phase 4: Readiness Verification & Controlled HTTP Server Binding
        // We only reach this point if Phase 5 (Readiness) passed.
        
        console.log('READY: System is fully operational.\n');
        
        // Start background processing only after successful READY state
        services.worker.startProcessing();
        
        const app = createApp({ config, ...services, logger });
        
        const server = app.listen(config.port, () => {
            logger.server.info('listening', { port: config.port });
            console.log('═══════════════════════════════');
            console.log(`READY TO ACCEPT TRAFFIC`);
            console.log(`Endpoint: http://localhost:${config.port}`);
            console.log('═══════════════════════════════\n');
            
            // Start Dashboard if in TTY
            if (process.stdout.isTTY) {
                services.dashboardService.start();
            } else {
                logger.server.info('dashboard_skipped', { reason: 'not_a_tty' });
            }
        });

        // Graceful Shutdown - Strict Sequence
        const shutdown = async (signal) => {
            logger.server.info('shutdown_signal_received', { signal });
            
            // 0. Stop Dashboard
            if (services.dashboardService) {
                services.dashboardService.stop();
            }

            // 1. Close HTTP Server (stop accepting new requests)
            await new Promise(resolve => {
                server.close(() => {
                    logger.server.info('http_server_closed');
                    resolve();
                });
            });

            // 2. Stop Worker Processing (stop pulling new jobs)
            services.worker.stopProcessing();
            
            // 3. Stop Session Monitor (stop background health checks)
            services.sessionMonitor.stop();
            
            // 4. Stop Metrics Service (stop interval timers)
            services.metricsService.shutdown();
            logger.server.info('metrics_service_closed');

            // 5. Clean up Browser Resources
            try {
                await services.browserManager.close();
                logger.server.info('browser_manager_closed');
            } catch (err) {
                logger.server.error('browser_cleanup_error', { error: err.message });
            }
                
            // 6. Close Database
            try {
                services.dbConnection.close();
                logger.server.info('db_connection_closed');
            } catch (err) {
                logger.server.error('db_cleanup_error', { error: err.message });
            }

            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        console.log('\n═══════════════════════════════');
        console.log(`Server listening on port ${config.port}`);
        console.log('═══════════════════════════════\n');
        
    } catch (error) {
        console.error('Fatal startup error:', error.message);
        process.exit(1);
    }
}

main();
