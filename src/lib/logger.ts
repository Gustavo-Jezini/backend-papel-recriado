import pino from 'pino';
import { env } from './env.js';

const redactPaths = [
  'req.headers.authorization',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.secret',
];

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    redact: {
      paths: redactPaths,
      censor: '[REDACTED]',
    },
  },
  env.NODE_ENV === 'development'
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true } })
    : undefined,
);
