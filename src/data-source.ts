import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './lib/env.js';
import { AdminUser } from './entities/AdminUser.js';
import { Client } from './entities/Client.js';
import { Order } from './entities/Order.js';
import { Product } from './entities/Product.js';
import { ProductImage } from './entities/ProductImage.js';
import { Image } from './entities/Image.js';
import { Banner } from './entities/Banner.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [AdminUser, Client, Order, Product, ProductImage, Image, Banner],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: env.NODE_ENV === 'development',
});
