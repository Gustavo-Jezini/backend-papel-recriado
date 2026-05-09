import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { AppError } from './middleware/errors.js';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import { authenticate } from './middleware/authenticate.js';
import authRouter from './routers/auth.js';
import clientsRouter from './routers/clients.js';
import ordersRouter from './routers/orders.js';

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ data: { status: 'ok' } });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/clients', authenticate, clientsRouter);
app.use('/api/v1/orders', authenticate, ordersRouter);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    });
  }

  logger.error({ err: error }, 'Unexpected error');
  const message =
    env.NODE_ENV === 'production' ? 'Internal server error' : error.message;
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } });
});

export default app;
