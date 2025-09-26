import { ZodError } from 'zod';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let errors;
    let message = err.message || 'Internal Server Error';

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        errors = err.errors;
    } else if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        errors = err.errors.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        }));
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate value detected';
    } else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON payload';
    }

    const response = new ApiResponse({
        success: false,
        message,
        errors,
        traceId: req.traceId,
    });

    logger.error({ err, traceId: req.traceId }, message);

    if (config.nodeEnv !== 'production' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
