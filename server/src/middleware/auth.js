import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/index.js';

const parseToken = (header) => {
    if (!header) {
        throw new ApiError(401, 'Authentication token is missing');
    }

    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw new ApiError(401, 'Authentication token is malformed');
    }

    return token;
};

export const requireAuth = (req, res, next) => {
    try {
        const token = parseToken(req.headers.authorization);
        const payload = jwt.verify(token, config.jwt.accessSecret);
        req.user = payload;
        next();
    } catch (error) {
        next(new ApiError(401, error.message || 'Authentication failed'));
    }
};

export const optionalAuth = (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (header) {
            const token = parseToken(header);
            req.user = jwt.verify(token, config.jwt.accessSecret);
        }
    } catch (error) {
        // Ignore optional auth errors but clear user object
        req.user = undefined;
    }
    next();
};
