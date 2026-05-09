import type { DataSourceOptions } from 'typeorm';
import { env } from './lib/env.js';
import { AdminUser } from './entities/AdminUser.js';
import { Client } from './entities/Client.js';
import { Order } from './entities/Order.js';
import { Product } from './entities/Product.js';
import { ProductImage } from './entities/ProductImage.js';
import { Image } from './entities/Image.js';
import { Banner } from './entities/Banner.js';

const entities = [AdminUser, Client, Order, Product, ProductImage, Image, Banner];

export function getDataSourceOptions(): DataSourceOptions {
  const common: DataSourceOptions = {
    type: 'postgres',
    url: env.DATABASE_URL,
    entities,
    migrationsTableName: 'typeorm_migrations',
  };

  if (env.NODE_ENV === 'test') {
    return {
      ...common,
      // Tests run in Jest ESM; avoid migrations glob/dynamic imports.
      migrations: [],
      synchronize: true,
      dropSchema: true,
      logging: false,
    };
  }

  return {
    ...common,
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: env.NODE_ENV === 'development',
  };
}
