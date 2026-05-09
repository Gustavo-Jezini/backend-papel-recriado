import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../data-source.js';
import { AdminUser } from '../../entities/AdminUser.js';
import { env } from '../../lib/env.js';

export const TEST_ADMIN_EMAIL = 'admin@test.com';
export const TEST_ADMIN_PASSWORD = 'test-password-123';

export async function seedTestAdmin(): Promise<AdminUser> {
  const repo = AppDataSource.getRepository(AdminUser);
  const existing = await repo.findOne({ where: { email: TEST_ADMIN_EMAIL } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 10);
  return repo.save(
    repo.create({ name: 'Admin Test', email: TEST_ADMIN_EMAIL, passwordHash }),
  );
}

export function generateToken(payload: Record<string, unknown> = {}): string {
  return jwt.sign(
    { sub: 'admin-test-uuid', email: TEST_ADMIN_EMAIL, ...payload },
    env.JWT_SECRET,
    { expiresIn: '1h' },
  );
}
