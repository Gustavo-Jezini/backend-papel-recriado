import { AppDataSource } from '../data-source.js';
import { AdminUser } from '../entities/AdminUser.js';

export const AdminUserRepository = AppDataSource.getRepository(AdminUser).extend({
  findByEmail(email: string): Promise<AdminUser | null> {
    return this.findOne({ where: { email } });
  },
});
