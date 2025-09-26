import { randomUUID } from 'crypto';

export const requestId = (req, res, next) => {
    const id = randomUUID();
    req.traceId = id;
    res.setHeader('X-Trace-Id', id);
    next();
};
