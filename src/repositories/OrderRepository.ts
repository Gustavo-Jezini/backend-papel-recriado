import { AppDataSource } from '../data-source.js';
import { Order } from '../entities/Order.js';
import type { OrderStatus } from '../entities/Order.js';

export interface OrderCursorResult {
  items: Order[];
  nextCursor?: string;
  hasMore: boolean;
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ createdAt: createdAt.toISOString(), id }),
  ).toString('base64');
}

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('createdAt' in parsed) ||
    !('id' in parsed) ||
    typeof (parsed as Record<string, unknown>).createdAt !== 'string' ||
    typeof (parsed as Record<string, unknown>).id !== 'string'
  ) {
    throw new Error('Invalid cursor');
  }
  return parsed as { createdAt: string; id: string };
}

export const OrderRepository = AppDataSource.getRepository(Order).extend({
  findByIdWithClient(id: string): Promise<Order | null> {
    return this.findOne({ where: { id }, relations: { client: true } });
  },

  async findManyWithCursor(
    limit: number,
    cursor?: string,
    status?: OrderStatus,
  ): Promise<OrderCursorResult> {
    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .orderBy('order.createdAt', 'ASC')
      .addOrderBy('order.id', 'ASC')
      .limit(limit + 1);

    if (status !== undefined) {
      qb.where('order.status = :status', { status });
    }

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      const condition =
        '(order.createdAt > :cursorCreatedAt OR (order.createdAt = :cursorCreatedAt AND order.id > :cursorId))';
      if (status !== undefined) {
        qb.andWhere(condition, { cursorCreatedAt: createdAt, cursorId: id });
      } else {
        qb.where(condition, { cursorCreatedAt: createdAt, cursorId: id });
      }
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem !== undefined
        ? encodeCursor(lastItem.createdAt, lastItem.id)
        : undefined;

    return { items, nextCursor, hasMore };
  },
});
