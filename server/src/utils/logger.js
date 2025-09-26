import pino from 'pino';
import { config } from '../config/index.js';

const prettyPrint =
    config.nodeEnv !== 'production'
        ? {
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname',
                  },
              },
          }
        : {};

export const logger = pino({
    level: config.logLevel,
    ...prettyPrint,
});
