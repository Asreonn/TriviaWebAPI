import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from './logger.js';

let connection = null;

export const connectDatabase = async () => {
    if (connection) {
        return connection;
    }

    try {
        mongoose.set('strictQuery', false);
        connection = await mongoose.connect(config.mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        logger.info('MongoDB connection established');
        return connection;
    } catch (error) {
        logger.error({ err: error }, 'Failed to connect to MongoDB');
        throw error;
    }
};

export const disconnectDatabase = async () => {
    if (!connection) return;
    await mongoose.disconnect();
    connection = null;
    logger.info('MongoDB connection closed');
};
