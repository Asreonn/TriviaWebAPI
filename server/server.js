import http from 'http';
import { app } from './src/app.js';
import { config } from './src/config/index.js';
import { connectDatabase, disconnectDatabase } from './src/utils/database.js';
import { initializeCache, shutdownCache } from './src/utils/cache.js';
import { shutdownBackgroundJobs, startBackgroundJobs } from './src/jobs/index.js';
import { logger } from './src/utils/logger.js';

const server = http.createServer(app);

const start = async () => {
    try {
        await connectDatabase();
        await initializeCache();
        await startBackgroundJobs();
        server.listen(config.port, () => {
            logger.info(`Server listening on port ${config.port}`);
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        await disconnectDatabase();
        await shutdownBackgroundJobs();
        await shutdownCache();
        logger.info('HTTP server closed');
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Shutdown timed out, forcing exit');
        process.exit(1);
    }, 10000).unref();
};

['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => shutdown(signal));
});

start();
