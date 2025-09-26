import { Queue, Worker } from 'bullmq';
import { config } from '../config/index.js';
import { QuizRepository } from '../repositories/quizRepository.js';
import { logger } from '../utils/logger.js';
import { getRedisConnection } from '../utils/cache.js';

const JOBS = {
    QUIZ_SERVED: 'quiz-served',
};

let queue;
let worker;

export const startBackgroundJobs = async () => {
    if (!config.redis.enabled) {
        logger.info('Background jobs disabled (Redis not configured)');
        return;
    }

    const connection = getRedisConnection();
    if (!connection) {
        logger.warn('Unable to start background jobs: Redis connection unavailable');
        return;
    }

    try {
        queue = new Queue(config.redis.jobQueueName, { connection });

        worker = new Worker(
            config.redis.jobQueueName,
            async (job) => {
                if (job.name === JOBS.QUIZ_SERVED) {
                    const { quizId } = job.data;
                    if (quizId) {
                        await QuizRepository.incrementServedMetrics(quizId);
                    }
                }
            },
            { connection }
        );

        worker.on('error', (err) => {
            logger.error({ err }, 'Background worker error');
        });

        logger.info('Background job queue initialized');
    } catch (error) {
        logger.error({ err: error }, 'Failed to initialize background job queue');
        queue = null;
        if (worker) {
            await worker.close();
            worker = null;
        }
    }
};

export const scheduleQuizServed = async (quizId) => {
    if (!queue) {
        await QuizRepository.incrementServedMetrics(quizId);
        return;
    }

    await queue.add(
        JOBS.QUIZ_SERVED,
        { quizId },
        {
            removeOnComplete: true,
            removeOnFail: true,
        }
    );
};

export const shutdownBackgroundJobs = async () => {
    const tasks = [];
    if (queue) {
        tasks.push(queue.close());
        queue = null;
    }
    if (worker) {
        tasks.push(worker.close());
        worker = null;
    }

    if (tasks.length > 0) {
        await Promise.all(tasks);
        logger.info('Background job system shut down');
    }
};
