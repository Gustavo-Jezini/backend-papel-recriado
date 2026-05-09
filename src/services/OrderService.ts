import type { DeepPartial, DeleteResult } from 'typeorm';
import type { Order, OrderStatus } from '../entities/Order.js';
import type { Client } from '../entities/Client.js';
import { NotFoundError, ValidationError } from '../middleware/errors.js';

interface IOrderRepository {
  findByIdWithClient(id: string): Promise<Order | null>;
  findManyWithCursor(
    limit: number,
    cursor?: string,
    status?: OrderStatus,
  ): Promise<{ items: Order[]; nextCursor?: string; hasMore: boolean }>;
  save(order: DeepPartial<Order>): Promise<Order>;
  delete(id: string): Promise<DeleteResult | void>;
}

interface IClientRepository {
  findByIdOrNull(id: string): Promise<Client | null>;
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['in_production', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export class OrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private clientRepo: IClientRepository,
  ) {}

  async createOrder(dto: DeepPartial<Order>): Promise<Order> {
    if (dto.clientId) {
      const client = await this.clientRepo.findByIdOrNull(dto.clientId);
      if (!client) {
        throw new NotFoundError(`Client with id ${dto.clientId} not found`);
      }
    }
    return this.orderRepo.save(dto);
  }

  async listOrders(
    limit: number,
    cursor?: string,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; meta: { nextCursor?: string; hasMore: boolean } }> {
    const { items, nextCursor, hasMore } = await this.orderRepo.findManyWithCursor(
      limit,
      cursor,
      status,
    );
    return { orders: items, meta: { nextCursor, hasMore } };
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepo.findByIdWithClient(id);
    if (!order) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrder(id: string, dto: DeepPartial<Order>): Promise<Order> {
    const existing = await this.orderRepo.findByIdWithClient(id);
    if (!existing) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }
    return this.orderRepo.save({ ...existing, ...dto, id });
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const existing = await this.orderRepo.findByIdWithClient(id);
    if (!existing) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    const allowed = VALID_TRANSITIONS[existing.status];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition: ${existing.status} -> ${newStatus}`,
      );
    }

    return this.orderRepo.save({ ...existing, status: newStatus, id });
  }

  async deleteOrder(id: string): Promise<void> {
    const existing = await this.orderRepo.findByIdWithClient(id);
    if (!existing) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }
    await this.orderRepo.delete(id);
  }
}
