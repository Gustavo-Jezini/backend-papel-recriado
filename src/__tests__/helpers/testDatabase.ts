import 'reflect-metadata';
import { AppDataSource } from '../../data-source.js';

export async function initializeTestDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export async function closeTestDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

export async function clearAllTables(): Promise<void> {
  await AppDataSource.query(
    `TRUNCATE TABLE orders, clients, admin_users, products, product_images, images, banners CASCADE`,
  );
}
