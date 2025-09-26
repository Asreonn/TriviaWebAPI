import Redis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from './logger.js';

let cacheClient;

const createClient = () => {
    if (!config.redis.enabled || !config.redis.url) {
        return null;
    }

    const client = new Redis(config.redis.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
    });

    client.on('error', (err) => {
        logger.error({ err }, 'Redis connection error');
    });

    client.on('connect', () => {
        logger.info('Redis cache connected');
    });

    client.on('close', () => {
        logger.warn('Redis cache connection closed');
    });

    return client;
};

export const initializeCache = async () => {
    if (!config.redis.enabled) {
        logger.info('Redis cache disabled');
        return null;
    }

    if (!cacheClient) {
        cacheClient = createClient();
        if (!cacheClient) {
            return null;
        }
        try {
            await cacheClient.connect();
        } catch (error) {
            logger.error({ err: error }, 'Unable to connect to Redis, disabling cache');
            cacheClient = null;
            return null;
        }
    }

    return cacheClient;
};

export const getCacheClient = () => cacheClient ?? null;

export const getRedisConnection = () => {
    if (!config.redis.enabled || !config.redis.url) {
        return null;
    }

    if (cacheClient) {
        return cacheClient.duplicate({ maxRetriesPerRequest: null });
    }

    return new Redis(config.redis.url, { maxRetriesPerRequest: null });
};

export const shutdownCache = async () => {
    if (cacheClient) {
        await cacheClient.quit();
        cacheClient = null;
        logger.info('Redis cache shut down');
    }
};
