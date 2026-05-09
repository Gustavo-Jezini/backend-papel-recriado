import 'reflect-metadata';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source.js';
import { AdminUser } from '../entities/AdminUser.js';

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().min(1),
});

async function main(): Promise<void> {
  const parsed = seedEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    process.stderr.write(`Missing or invalid environment variables: ${errors}\n`);
    process.exit(1);
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = parsed.data;

  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(AdminUser);
  const existing = await repo.findOne({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    process.stdout.write(`Admin user already exists: ${ADMIN_EMAIL}\n`);
    await AppDataSource.destroy();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = repo.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
  });

  await repo.save(admin);
  process.stdout.write(`Admin user created: ${ADMIN_EMAIL}\n`);

  await AppDataSource.destroy();
  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`Seed failed: ${String(err)}\n`);
  process.exit(1);
});
