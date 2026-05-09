import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { AdminUserRepository } from '../repositories/AdminUserRepository.js';

const authService = new AuthService(AdminUserRepository);

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    res.json({ data: result });
  },
};
