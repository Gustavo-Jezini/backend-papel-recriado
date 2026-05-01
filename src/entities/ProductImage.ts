import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Product } from './Product.js';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_product_images_product_id')
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne('Product', 'images', { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'text' })
  url!: string;

  @Column({ name: 'alt_text', type: 'text', nullable: true })
  altText!: string | null;

  @Column({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
