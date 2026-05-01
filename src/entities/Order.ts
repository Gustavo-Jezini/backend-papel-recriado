import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Client } from './Client.js';

export type OrderStatus =
  | 'pending'
  | 'in_production'
  | 'ready'
  | 'delivered'
  | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_orders_client_id')
  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId!: string | null;

  @ManyToOne('Client', 'orders', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'client_id' })
  client!: Client | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index('idx_orders_status')
  @Column({ type: 'text', default: 'pending' })
  status!: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  amount!: string | null;

  @Index('idx_orders_delivery_deadline')
  @Column({ name: 'delivery_deadline', type: 'date', nullable: true })
  deliveryDeadline!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
