import 'dotenv/config';
import { AppDataSource } from './data-source.js';
import { env } from './lib/env.js';
import app from './app.js';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();

  app.listen(Number(env.PORT), () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
