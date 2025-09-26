import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

export const createRateLimiter = (options = {}) =>
    rateLimit({
        windowMs: (options.windowMinutes ?? config.rateLimit.windowMinutes) * 60 * 1000,
        max: options.max ?? config.rateLimit.maxRequests,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (req, res, next) => {
            next(new ApiError(429, 'Too many requests, please try again later.'));
        },
        keyGenerator: (req) => req.ip,
    });
