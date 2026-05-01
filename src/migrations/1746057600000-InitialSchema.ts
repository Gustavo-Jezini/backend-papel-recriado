import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class InitialSchema1746057600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. admin_users
    await queryRunner.createTable(
      new Table({
        name: 'admin_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'email', type: 'text', isNullable: false, isUnique: true },
          { name: 'password_hash', type: 'text', isNullable: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    // 2. clients
    await queryRunner.createTable(
      new Table({
        name: 'clients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'phone', type: 'text', isNullable: true },
          { name: 'email', type: 'text', isNullable: true },
          { name: 'instagram', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    // 3. orders
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'client_id', type: 'uuid', isNullable: true },
          { name: 'title', type: 'text', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'status', type: 'text', isNullable: false, default: "'pending'" },
          { name: 'amount', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'delivery_deadline', type: 'date', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.query(`
      ALTER TABLE orders ADD CONSTRAINT chk_orders_status
      CHECK (status IN ('pending', 'in_production', 'ready', 'delivered', 'cancelled'))
    `);

    await queryRunner.createIndex('orders', new TableIndex({ name: 'idx_orders_client_id', columnNames: ['client_id'] }));
    await queryRunner.createIndex('orders', new TableIndex({ name: 'idx_orders_status', columnNames: ['status'] }));
    await queryRunner.createIndex('orders', new TableIndex({ name: 'idx_orders_delivery_deadline', columnNames: ['delivery_deadline'] }));

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'fk_orders_clients',
        columnNames: ['client_id'],
        referencedTableName: 'clients',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'RESTRICT',
      })
    );

    // 4. products
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'price', type: 'numeric', precision: 12, scale: 2, isNullable: false },
          { name: 'stock_quantity', type: 'integer', isNullable: false, default: '0' },
          { name: 'category', type: 'text', isNullable: false },
          { name: 'active', type: 'boolean', isNullable: false, default: 'true' },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('products', new TableIndex({ name: 'idx_products_category', columnNames: ['category'] }));
    await queryRunner.createIndex('products', new TableIndex({ name: 'idx_products_active', columnNames: ['active'] }));

    // 5. product_images
    await queryRunner.createTable(
      new Table({
        name: 'product_images',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'url', type: 'text', isNullable: false },
          { name: 'alt_text', type: 'text', isNullable: true },
          { name: 'order_index', type: 'integer', isNullable: false, default: '0' },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('product_images', new TableIndex({ name: 'idx_product_images_product_id', columnNames: ['product_id'] }));

    await queryRunner.createForeignKey(
      'product_images',
      new TableForeignKey({
        name: 'fk_product_images_products',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
      })
    );

    // 6. images
    await queryRunner.createTable(
      new Table({
        name: 'images',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'url', type: 'text', isNullable: false },
          { name: 'alt_text', type: 'text', isNullable: true },
          { name: 'category', type: 'text', isNullable: false },
          { name: 'order_index', type: 'integer', isNullable: false, default: '0' },
          { name: 'active', type: 'boolean', isNullable: false, default: 'true' },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('images', new TableIndex({ name: 'idx_images_category_active_order', columnNames: ['category', 'active', 'order_index'] }));

    // 7. banners
    await queryRunner.createTable(
      new Table({
        name: 'banners',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'title', type: 'text', isNullable: false },
          { name: 'subtitle', type: 'text', isNullable: true },
          { name: 'image_url', type: 'text', isNullable: false },
          { name: 'link_url', type: 'text', isNullable: true },
          { name: 'active', type: 'boolean', isNullable: false, default: 'true' },
          { name: 'order_index', type: 'integer', isNullable: false, default: '0' },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('banners', new TableIndex({ name: 'idx_banners_active_order', columnNames: ['active', 'order_index'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('banners', 'idx_banners_active_order');
    await queryRunner.dropTable('banners');

    await queryRunner.dropIndex('images', 'idx_images_category_active_order');
    await queryRunner.dropTable('images');

    await queryRunner.dropIndex('product_images', 'idx_product_images_product_id');
    await queryRunner.dropForeignKey('product_images', 'fk_product_images_products');
    await queryRunner.dropTable('product_images');

    await queryRunner.dropIndex('products', 'idx_products_active');
    await queryRunner.dropIndex('products', 'idx_products_category');
    await queryRunner.dropTable('products');

    await queryRunner.query(`ALTER TABLE orders DROP CONSTRAINT chk_orders_status`);
    await queryRunner.dropForeignKey('orders', 'fk_orders_clients');
    await queryRunner.dropIndex('orders', 'idx_orders_delivery_deadline');
    await queryRunner.dropIndex('orders', 'idx_orders_status');
    await queryRunner.dropIndex('orders', 'idx_orders_client_id');
    await queryRunner.dropTable('orders');

    await queryRunner.dropTable('clients');
    await queryRunner.dropTable('admin_users');
  }
}
