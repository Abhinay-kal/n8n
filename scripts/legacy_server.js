const { startServer } = require('./src/server');

startServer().catch((error) => {
    console.error('[Server] fatal start error', { error: error.message });
    process.exitCode = 1;
});