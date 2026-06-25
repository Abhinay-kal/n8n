const { loadConfig } = require('./src/config/config');
const { createLogger } = require('./src/utils/logger');
const { PersistentWorkerState: WorkerState } = require('./src/models/WorkerState');
const { BrowserManager } = require('./src/services/BrowserManager');
const { SessionMonitor } = require('./src/services/SessionMonitor');
const { ClaudeWorker } = require('./src/services/ClaudeWorker');

let singletonWorker = null;

async function getSingletonWorker() {
    if (singletonWorker) {
        return singletonWorker;
    }

    const config = loadConfig();
    const logger = {
        browser: createLogger('BrowserManager'),
        session: createLogger('SessionMonitor'),
        worker: createLogger('ClaudeWorker'),
        state: createLogger('WorkerState')
    };

    const workerState = new WorkerState(logger.state);
    const browserManager = new BrowserManager({ config, logger: logger.browser, workerState });
    const sessionMonitor = new SessionMonitor({ browserManager, config, logger: logger.session, workerState });
    singletonWorker = new ClaudeWorker({ browserManager, sessionMonitor, workerState, config, logger: logger.worker });
    await singletonWorker.initialize();
    return singletonWorker;
}

async function runClaude(prompt) {
    const worker = await getSingletonWorker();
    return worker.rewrite(prompt);
}

module.exports = {
    runClaude,
    getSingletonWorker
};