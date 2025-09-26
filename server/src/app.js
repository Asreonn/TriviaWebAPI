import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

const app = express();

const resolveCorsOrigin = () => {
    if (config.corsOrigin === '*') {
        return true;
    }

    return config.corsOrigin.split(',').map((origin) => origin.trim());
};

app.use(requestId);
app.use(
    pinoHttp({
        logger,
        customLogLevel: (res, err) => {
            if (err || res.statusCode >= 500) {
                return 'error';
            }
            if (res.statusCode >= 400) {
                return 'warn';
            }
            return 'info';
        },
        customProps: (req) => ({ traceId: req.traceId }),
    })
);
app.use(helmet());
app.use(
    cors({
        origin: resolveCorsOrigin(),
        credentials: true,
    })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiLimiter = createRateLimiter();
app.use('/api', apiLimiter);
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export { app };
