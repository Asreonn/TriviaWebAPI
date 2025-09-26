import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().optional(),
    MONGODB_URI: z
        .string()
        .min(1, 'MONGODB_URI is required')
        .default('mongodb://localhost:27017/triviapi'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z
        .string()
        .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    RATE_LIMIT_WINDOW_MINUTES: z.string().default('1'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('60'),
    CORS_ORIGIN: z.string().default('*'),
    LOG_LEVEL: z.string().default('info'),
    REDIS_URL: z.string().url().optional(),
    REDIS_CACHE_TTL_SECONDS: z.string().optional(),
    JOB_QUEUE_NAME: z.string().default('triviapi-jobs'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
}

const env = parsed.data;

export const config = {
    nodeEnv: env.NODE_ENV,
    port: parseInt(env.PORT ?? '5000', 10),
    mongoUri: env.MONGODB_URI,
    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    rateLimit: {
        windowMinutes: parseInt(env.RATE_LIMIT_WINDOW_MINUTES, 10),
        maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    },
    corsOrigin: env.CORS_ORIGIN,
    logLevel: env.LOG_LEVEL,
    redis: {
        enabled: Boolean(env.REDIS_URL),
        url: env.REDIS_URL,
        cacheTtlSeconds: parseInt(env.REDIS_CACHE_TTL_SECONDS ?? '60', 10),
        jobQueueName: env.JOB_QUEUE_NAME,
    },
};
