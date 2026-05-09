import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AdminUser } from '../entities/AdminUser.js';
import { UnauthorizedError } from '../middleware/errors.js';
import { env } from '../lib/env.js';

interface IAdminUserRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
}

export class AuthService {
  constructor(private adminRepo: IAdminUserRepository) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; expiresIn: string }> {
    const admin = await this.adminRepo.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    return { token, expiresIn: env.JWT_EXPIRES_IN };
  }
}
